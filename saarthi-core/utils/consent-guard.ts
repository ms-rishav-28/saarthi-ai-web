import { z } from 'zod';
import { sql } from '../db/client.js';

const consentSchema = z.object({
  whatsappNumber: z.string().min(8),
  consentScope: z.enum(['digilocker', 'aadhaar_ekyc', 'submission']),
  consentText: z.string().min(8),
  granted: z.boolean(),
});

export type ConsentInput = z.infer<typeof consentSchema>;

export function assertConsent(input: ConsentInput): ConsentInput {
  return consentSchema.parse(input);
}

export async function recordConsent(input: ConsentInput, metadata?: Record<string, unknown>) {
  const consent = assertConsent(input);

  await sql`
    insert into consent_audit_log (
      whatsapp_number,
      consent_scope,
      consent_text,
      consent_granted,
      consent_metadata
    ) values (
      ${consent.whatsappNumber},
      ${consent.consentScope},
      ${consent.consentText},
      ${consent.granted},
      ${JSON.stringify(metadata || {})}::jsonb
    )
  `;
}
