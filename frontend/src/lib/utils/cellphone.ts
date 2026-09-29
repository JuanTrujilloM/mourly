const COUNTRY_CODE = '57';
const LOCAL_DIGITS = 10;

// The +57 prefix is fixed in the UI, so a pasted international number
// (+57 300..., 57300...) is reduced to the 10 local digits.
export function toLocalCellphone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const hasCountryCode =
    digits.length === COUNTRY_CODE.length + LOCAL_DIGITS &&
    digits.startsWith(COUNTRY_CODE);
  return hasCountryCode ? digits.slice(COUNTRY_CODE.length) : digits;
}
