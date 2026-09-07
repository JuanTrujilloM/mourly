import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';
import type { AuthUser } from '@/types/auth';

export const routerReplace = vi.fn();
export const routerPush = vi.fn();

// Shared across every test file, so a suite that seeds it must clear it too.
export const searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: routerReplace, push: routerPush }),
  useSearchParams: () => searchParams,
  useParams: () => ({}),
  usePathname: () => '/',
}));

export const AUTH_USER: AuthUser = {
  id: 'u1',
  email: 'ana@eafit.edu.co',
  cellphone: '+573001112233',
  isVerified: true,
  university: 'EAFIT',
  onboardingCompleted: true,
  isAdmin: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

export function renderWithQuery(
  ui: ReactElement,
  client: QueryClient = createQueryClient(),
): RenderResult {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  }
  return render(ui, { wrapper: Wrapper });
}
