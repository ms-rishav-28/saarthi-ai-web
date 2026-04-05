import 'dotenv/config';
import express from 'express';
import {
  exchangeCodeForToken,
  parseDigiLockerState,
  pullCitizenDocuments,
} from './integrations/digilocker.js';
import { handleWhatsAppWebhook } from './integrations/whatsapp-cloud.js';
import { recordConsent } from './utils/consent-guard.js';
import { logger } from './utils/logger.js';
import {
  markDigiLockerConsentComplete,
  runMatruVandanaGraph,
} from './workflows/matru-vandana-graph.js';
import { sql } from './db/client.js';
import { getLangGraphCheckpointer } from './supabase/checkpointers.js';

const app = express();
const port = Number(process.env.PORT || 8080);

app.use(express.json({ limit: '1mb' }));

app.get('/healthz', (_req, res) => {
  res.status(200).json({ ok: true, service: 'saarthi-core' });
});

app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post('/webhook/whatsapp', async (req, res) => {
  try {
    await handleWhatsAppWebhook(req.body);
    res.sendStatus(200);
  } catch (error) {
    logger.error({ error }, 'Webhook processing failed');
    res.sendStatus(500);
  }
});

app.get('/oauth/digilocker/callback', async (req, res) => {
  try {
    const code = String(req.query.code || '');
    const encodedState = String(req.query.state || '');

    if (!code || !encodedState) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    const state = parseDigiLockerState(encodedState);
    const token = await exchangeCodeForToken(code);
    const documents = await pullCitizenDocuments(token.access_token);

    await recordConsent(
      {
        whatsappNumber: state.whatsappNumber,
        consentScope: 'digilocker',
        consentText: 'Citizen approved DigiLocker OAuth document fetch',
        granted: true,
      },
      {
        nonce: state.nonce,
        stateCreatedAt: state.createdAt,
      },
    );

    await markDigiLockerConsentComplete(state.whatsappNumber, documents.raw, documents.aadhaarLast4);

    await runMatruVandanaGraph({
      whatsappNumber: state.whatsappNumber,
      incomingText: 'CONSENT_COMPLETED',
      languageHint: 'hi',
    });

    return res.status(200).send('DigiLocker consent complete. Workflow resumed.');
  } catch (error) {
    logger.error({ error }, 'DigiLocker callback failed');
    return res.status(500).send('DigiLocker callback failed');
  }
});

async function bootstrap() {
  await sql`select 1 as ok`;
  await getLangGraphCheckpointer();

  app.listen(port, () => {
    logger.info({ port }, 'Saarthi Core server listening');
  });
}

bootstrap().catch((error) => {
  logger.error({ error }, 'Startup failed');
  process.exit(1);
});
