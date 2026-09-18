export type SmsOrigin = { from: string } | { messagingServiceSid: string };

export function smsOriginFrom(
  messagingServiceSid: string | undefined,
  from: string | undefined,
): SmsOrigin | null {
  if (messagingServiceSid) {
    return { messagingServiceSid };
  }
  if (from) {
    return { from };
  }
  return null;
}
