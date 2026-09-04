import { Transform } from 'class-transformer';

export const DOMAIN_PATTERN = /^[a-z0-9.-]+\.[a-z]{2,}$/;

export function NormalizeDomain(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
}
