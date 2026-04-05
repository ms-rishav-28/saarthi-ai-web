import { sendWhatsAppText } from '../integrations/whatsapp-cloud.js';

export async function runCommunicationAgent(whatsappNumber: string, message: string) {
  await sendWhatsAppText(whatsappNumber, message);
}
