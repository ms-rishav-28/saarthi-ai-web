import { runMatruVandanaGraph } from '../workflows/matru-vandana-graph.js';
import { logger } from '../utils/logger.js';
import { transcribeIndicVoice } from './sarvam.js';

export async function handleWhatsAppWebhook(payload: any) {
  const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return;

  const whatsappNumber = message.from;
  const text = message.text?.body || '';
  const languageHint = inferLanguageHint(text);

  let incomingText = text;
  if (!incomingText && message.type === 'audio') {
    // WhatsApp sends media id; production flow should resolve media URL and pass that URL to Sarvam STT.
    incomingText = await transcribeIndicVoice(`wa-media://${message.audio?.id || 'unknown'}`, languageHint);
  }

  logger.info({ whatsappNumber }, 'Inbound WhatsApp message received');

  await runMatruVandanaGraph({
    whatsappNumber,
    incomingText,
    languageHint,
  });
}

function inferLanguageHint(text: string): 'hi' | 'mr' {
  const normalized = text.toLowerCase();
  const marathiHints = ['माझी', 'झाला', 'महाराष्ट्र', 'बाळ'];
  return marathiHints.some((t) => normalized.includes(t)) ? 'mr' : 'hi';
}

export async function sendWhatsAppText(to: string, text: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    throw new Error('Missing WhatsApp Cloud API credentials');
  }

  const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!response.ok) {
    throw new Error('WhatsApp send failed');
  }
}
