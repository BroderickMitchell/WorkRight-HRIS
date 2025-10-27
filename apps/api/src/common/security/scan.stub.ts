// NOTE: Stub virus scanner. Replace with AV integration.
export type ScanResult = 'pending' | 'clean' | 'flagged';

export async function scanObject(_key: string): Promise<ScanResult> {
  // Simulate a clean result. Hook into ClamAV or a SaaS in production.
  return 'clean';
}

