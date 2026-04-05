import { withGovRetryAndCircuitBreaker } from '../utils/government-retry.js';

export async function runSubmissionAgent(applicationPayload: Record<string, unknown>) {
  const result = await withGovRetryAndCircuitBreaker('matru_vandana_portal', async () => {
    if (!applicationPayload) throw new Error('Invalid payload');
    return { submitted: true, referenceId: `PMMVY-${Date.now()}` };
  });

  if (result.fallbackToCsc) {
    return {
      status: 'csc_fallback_booked',
      details: {
        message: 'Government portal unavailable. CSC booking created.',
        reason: result.reason,
      },
    };
  }

  return {
    status: 'submitted',
    details: result.value,
  };
}
