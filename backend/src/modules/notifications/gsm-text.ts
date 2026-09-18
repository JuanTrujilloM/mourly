const OUTSIDE_GSM7: Record<string, string> = {
  á: 'a',
  í: 'i',
  ó: 'o',
  ú: 'u',
  Á: 'A',
  Í: 'I',
  Ó: 'O',
  Ú: 'U',
  '·': '-',
};

const REPLACEABLE = /[áíóúÁÍÓÚ·]/g;

export function toGsmText(value: string): string {
  return value.replace(REPLACEABLE, (char) => OUTSIDE_GSM7[char]);
}
