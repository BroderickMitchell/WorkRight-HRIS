// NOTE: Stub implementation. Replace with KMS/Vault integrated encryption.
export function encryptToBytes(plaintext: string): Buffer {
  // DO NOT USE IN PRODUCTION. Placeholder to keep types compiling.
  return Buffer.from(plaintext, 'utf8');
}

export function decryptFromBytes(cipher: Buffer): string {
  return cipher.toString('utf8');
}
