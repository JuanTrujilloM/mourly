import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithQuery, routerPush } from '@/test-utils';
import { remainingResendCooldown } from '@/lib/utils/resend-cooldown';
import { RESEND_COOLDOWN_SECONDS } from '@/lib/constants/auth';
import * as authApi from '@/lib/api/auth';
import { LoginForm } from './LoginForm';

vi.mock('@/lib/api/auth');

const requestLoginCode = vi.mocked(authApi.requestLoginCode);

const EMAIL = 'ana@eafit.edu.co';

async function submitEmail(value = EMAIL) {
  await userEvent.type(screen.getByLabelText('Correo institucional'), value);
  await userEvent.click(
    screen.getByRole('button', { name: 'Enviar código de acceso' }),
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('sends the visitor to the verification step', async () => {
    requestLoginCode.mockResolvedValue({ message: 'ok' });

    renderWithQuery(<LoginForm />);
    await submitEmail();

    await waitFor(() =>
      expect(routerPush).toHaveBeenCalledWith(
        `/verify?email=${encodeURIComponent(EMAIL)}`,
      ),
    );
  });

  it('records the cooldown so a reload does not restart the countdown', async () => {
    requestLoginCode.mockResolvedValue({ message: 'ok' });

    renderWithQuery(<LoginForm />);
    await submitEmail();

    await waitFor(() =>
      expect(remainingResendCooldown(EMAIL)).toBe(RESEND_COOLDOWN_SECONDS),
    );
  });

  it('records no cooldown when the request failed', async () => {
    requestLoginCode.mockRejectedValue(new Error('boom'));

    renderWithQuery(<LoginForm />);
    await submitEmail();

    await waitFor(() =>
      expect(screen.getByText(/Algo salió mal/)).toBeInTheDocument(),
    );
    expect(remainingResendCooldown(EMAIL)).toBe(0);
  });
});
