import type { ExecutionContext } from '@nestjs/common';

export function executionContextWith(
  request: Record<string, unknown>,
): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}
