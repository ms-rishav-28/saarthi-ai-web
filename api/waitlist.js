import { neon } from '@neondatabase/serverless';

const allowedRoles = new Set([
  'citizen',
  'ngo',
  'bank',
  'hospital',
  'ca',
  'govt',
  'investor',
]);

const ipRateLimit = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function enforceRateLimit(req) {
  const now = Date.now();
  const ip = getClientIp(req);
  const entry = ipRateLimit.get(ip) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > entry.resetAt) {
    ipRateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  ipRateLimit.set(ip, entry);
  return { allowed: true };
}

function getNeonSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL');
  }

  return neon(connectionString);
}

function normalizePayload(body = {}) {
  return {
    name: String(body.name || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    role: String(body.role || '').trim().toLowerCase(),
    location: String(body.location || '').trim(),
    consent: body.consent === true,
    website: String(body.website || '').trim(),
  };
}

function validatePayload(payload) {
  if (payload.website) {
    return 'Bot detection failed';
  }
  if (payload.name.length < 2 || payload.name.length > 120) {
    return 'Please enter a valid name';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email) || payload.email.length > 190) {
    return 'Please enter a valid email address';
  }
  if (!allowedRoles.has(payload.role)) {
    return 'Please select your profile';
  }
  if (payload.location.length > 120) {
    return 'City or state is too long';
  }
  if (!payload.consent) {
    return 'Consent is required to join the waitlist';
  }
  return null;
}

async function getWaitlistCount(sql) {
  const rows = await sql`select count(*)::int as count from waitlist_signups`;
  return Number(rows?.[0]?.count || 0);
}

export default async function handler(req, res) {
  const rateLimit = enforceRateLimit(req);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfter));
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  }

  let sql;
  try {
    sql = getNeonSql();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  if (req.method === 'GET') {
    try {
      const count = await getWaitlistCount(sql);
      return res.status(200).json({ count });
    } catch {
      return res.status(500).json({ error: 'Failed to fetch waitlist count' });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = normalizePayload(req.body);
  const validationError = validatePayload(payload);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    await sql`
      insert into waitlist_signups (
        name,
        email,
        role,
        location,
        consent,
        source,
        metadata
      ) values (
        ${payload.name},
        ${payload.email},
        ${payload.role},
        ${payload.location || null},
        ${payload.consent},
        'landing_page',
        ${JSON.stringify({
          userAgent: req.headers['user-agent'] || null,
          ipHint: getClientIp(req),
        })}::jsonb
      )
    `;

    const count = await getWaitlistCount(sql);
    return res.status(201).json({ ok: true, count });
  } catch (error) {
    if (error && error.code === '23505') {
      const count = await getWaitlistCount(sql);
      return res.status(200).json({ ok: true, alreadyJoined: true, count });
    }
    return res.status(500).json({ error: 'Failed to store waitlist signup' });
  }
}
