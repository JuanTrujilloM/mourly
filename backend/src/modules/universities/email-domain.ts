export function getEmailDomain(email: string): string {
  return email.trim().toLowerCase().split('@')[1] ?? '';
}
