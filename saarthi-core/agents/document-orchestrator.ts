import { buildDigiLockerConsentUrl, buildDigiLockerState } from '../integrations/digilocker.js';

export async function runDocumentOrchestrator(whatsappNumber: string) {
  const state = buildDigiLockerState(whatsappNumber);
  const consentUrl = buildDigiLockerConsentUrl(state);

  return {
    state,
    consentUrl,
    requiredDocuments: ['Aadhaar (masked)', 'Birth certificate', 'Bank passbook'],
    status: 'consent_required',
  };
}
