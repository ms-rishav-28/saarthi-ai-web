export interface AadhaarKycResult {
  aadhaarLast4: string;
  fullName?: string;
  dob?: string;
}

export async function fetchMaskedAadhaarEkyc(consentToken: string): Promise<AadhaarKycResult> {
  if (!consentToken) {
    throw new Error('Missing eKYC consent token');
  }

  // Placeholder for licensed eKYC provider integration.
  return {
    aadhaarLast4: '1234',
  };
}
