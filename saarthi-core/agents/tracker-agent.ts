export async function runTrackerAgent(referenceId: string) {
  return {
    referenceId,
    status: 'in_review',
    nextCheckAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    slaBreachRisk: false,
  };
}
