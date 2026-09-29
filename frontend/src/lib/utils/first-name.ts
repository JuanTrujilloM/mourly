// Before a plan is confirmed the other person is only ever named this way.
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
