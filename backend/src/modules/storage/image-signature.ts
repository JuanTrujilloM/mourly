const SIGNATURE_BY_MIME_TYPE = new Map<string, number[]>([
  ['image/jpeg', [0xff, 0xd8, 0xff]],
  ['image/png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
]);

export function matchesImageSignature(
  mimeType: string,
  content: Buffer,
): boolean {
  const signature = SIGNATURE_BY_MIME_TYPE.get(mimeType);
  if (!signature || content.length < signature.length) return false;
  return signature.every((byte, index) => content[index] === byte);
}
