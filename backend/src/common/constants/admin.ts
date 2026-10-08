export function parseAdminEmails(raw: string): Set<string> {
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string): boolean {
  const admins = parseAdminEmails(process.env.ADMIN_EMAILS ?? '');
  return admins.has(email.trim().toLowerCase());
}
