const COLOMBIA_COUNTRY_CODE = '57';
const LOCAL_MOBILE_DIGITS = 10;

export function toE164Colombia(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const withCountryCode =
    digits.length === LOCAL_MOBILE_DIGITS
      ? `${COLOMBIA_COUNTRY_CODE}${digits}`
      : digits;
  return `+${withCountryCode}`;
}
