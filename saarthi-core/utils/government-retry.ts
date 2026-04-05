type AsyncCall<T> = () => Promise<T>;

const serviceCircuitMap = new Map<string, { failures: number; openedUntil?: number }>();

export interface RetryResult<T> {
  ok: boolean;
  value?: T;
  fallbackToCsc: boolean;
  attempts: number;
  reason?: 'max_retries' | 'circuit_open';
}

export async function withGovRetryAndCircuitBreaker<T>(
  service: string,
  fn: AsyncCall<T>,
  maxAttempts = 3,
  circuitOpenMs = 60_000,
): Promise<RetryResult<T>> {
  const circuitState = serviceCircuitMap.get(service) || { failures: 0 };
  const now = Date.now();

  if (circuitState.openedUntil && now < circuitState.openedUntil) {
    return { ok: false, fallbackToCsc: true, attempts: 0, reason: 'circuit_open' };
  }

  let attempts = 0;
  while (attempts < maxAttempts) {
    attempts += 1;
    try {
      const value = await fn();
      serviceCircuitMap.set(service, { failures: 0 });
      return { ok: true, value, fallbackToCsc: false, attempts };
    } catch {
      if (attempts >= maxAttempts) {
        serviceCircuitMap.set(service, {
          failures: circuitState.failures + 1,
          openedUntil: Date.now() + circuitOpenMs,
        });
        return { ok: false, fallbackToCsc: true, attempts, reason: 'max_retries' };
      }
      await new Promise((r) => setTimeout(r, attempts * 800));
    }
  }

  return { ok: false, fallbackToCsc: true, attempts, reason: 'max_retries' };
}
