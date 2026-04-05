import { z } from 'zod';

const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
});

const encodedStateSchema = z.object({
  whatsappNumber: z.string().min(8),
  nonce: z.string().min(8),
  createdAt: z.number().int(),
});

export interface DigiLockerDocuments {
  aadhaarLast4?: string;
  birthCertificateAvailable: boolean;
  bankDocumentAvailable: boolean;
  raw: Record<string, unknown>;
}

export function buildDigiLockerState(whatsappNumber: string): string {
  const state = {
    whatsappNumber,
    nonce: `dl-${Math.random().toString(36).slice(2, 12)}`,
    createdAt: Date.now(),
  };

  return Buffer.from(JSON.stringify(state), 'utf8').toString('base64url');
}

export function parseDigiLockerState(encoded: string) {
  const decoded = Buffer.from(encoded, 'base64url').toString('utf8');
  return encodedStateSchema.parse(JSON.parse(decoded));
}

export function buildDigiLockerConsentUrl(state: string) {
  const base = process.env.DIGILOCKER_AUTH_BASE_URL || 'https://partners.apisetu.gov.in';
  const url = new URL('/oauth2/authorize', base);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', process.env.DIGILOCKER_CLIENT_ID || '');
  url.searchParams.set('redirect_uri', process.env.DIGILOCKER_REDIRECT_URI || '');
  url.searchParams.set('scope', 'openid profile digilocker.pull');
  url.searchParams.set('state', state);
  return url.toString();
}

export async function exchangeCodeForToken(code: string) {
  const tokenUrl = process.env.DIGILOCKER_TOKEN_URL || 'https://partners.apisetu.gov.in/oauth2/token';
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.DIGILOCKER_REDIRECT_URI || '',
    client_id: process.env.DIGILOCKER_CLIENT_ID || '',
    client_secret: process.env.DIGILOCKER_CLIENT_SECRET || '',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) throw new Error('Failed DigiLocker token exchange');
  const payload = await response.json();
  return tokenResponseSchema.parse(payload);
}

export async function pullCitizenDocuments(accessToken: string): Promise<DigiLockerDocuments> {
  const base = process.env.DIGILOCKER_AUTH_BASE_URL || 'https://partners.apisetu.gov.in';
  const docsEndpoint = new URL('/digilocker/v1/documents', base).toString();

  const response = await fetch(docsEndpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed DigiLocker document pull: ${response.status}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const docs = Array.isArray(payload.documents) ? payload.documents : [];
  const docsText = JSON.stringify(docs).toLowerCase();

  const maskedAadhaarMatch = docsText.match(/\b\d{4}\b/);

  return {
    aadhaarLast4: maskedAadhaarMatch?.[0],
    birthCertificateAvailable: docsText.includes('birth') || docsText.includes('birthcertificate'),
    bankDocumentAvailable: docsText.includes('passbook') || docsText.includes('bank'),
    raw: payload,
  };
}
