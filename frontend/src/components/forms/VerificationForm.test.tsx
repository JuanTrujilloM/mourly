import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithQuery, searchParams } from '@/test-utils';
import * as authApi from '@/lib/api/auth';
import { rememberResendCooldown } from '@/lib/utils/resend-cooldown';
import { VerificationForm } from './VerificationForm';

const EMAIL = 'ana@eafit.edu.co';

vi.mock('@/lib/api/auth');

const verifyCode = vi.mocked(authApi.verifyCode);
const resendCode = vi.mocked(authApi.resendCode);

function apiError(
  status: number,
  message: string,
  retryAfterSeconds?: number,
): AxiosError {
  const error = new AxiosError('request failed');
  error.response = {
    data: { message, retryAfterSeconds },
    status,
    statusText: 'Error',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

function resendButton() {
  return screen.getByRole('button', { name: /Reenviar código/ });
}

async function tickSeconds(seconds: number) {
  for (let index = 0; index < seconds; index += 1) {
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
  }
}

// waitFor cannot run on fake timers, so the countdown is fast-forwarded first
// and the clock handed back before any assertion that polls.
async function renderPastCooldown() {
  vi.useFakeTimers();
  renderWithQuery(<VerificationForm />);
  await tickSeconds(60);
  vi.useRealTimers();
}

async function submitCode() {
  await userEvent.type(screen.getByLabelText(/código/i), '123456');
  await userEvent.click(screen.getByRole('button', { name: 'Verificar' }));
}

describe('VerificationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    searchParams.set('email', EMAIL);
  });

  afterEach(() => {
    searchParams.delete('email');
    vi.useRealTimers();
  });

  it('does not promise a code was sent, since the API answers neutrally', () => {
    renderWithQuery(<VerificationForm />);

    expect(screen.getByText(/es una cuenta válida/i)).toBeInTheDocument();
    expect(screen.queryByText(/que enviamos a/i)).not.toBeInTheDocument();
  });

  it('offers registration when the code is rejected', async () => {
    verifyCode.mockRejectedValue(new Error('nope'));

    renderWithQuery(<VerificationForm />);
    await submitCode();

    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Registrate' })).toHaveAttribute(
        'href',
        '/register',
      ),
    );
  });

  describe('resend cooldown', () => {
    it('opens counting down, since a code was just sent', async () => {
      vi.useFakeTimers();
      rememberResendCooldown(EMAIL);

      renderWithQuery(<VerificationForm />);
      await tickSeconds(2);

      expect(resendButton()).toBeDisabled();
      expect(resendButton()).toHaveTextContent('Reenviar código en 58 s');
    });

    it('resumes a cooldown that started before the page was reloaded', async () => {
      vi.useFakeTimers();
      rememberResendCooldown(EMAIL);
      vi.advanceTimersByTime(45_000);

      renderWithQuery(<VerificationForm />);
      await tickSeconds(0);

      expect(resendButton()).toHaveTextContent('Reenviar código en 15 s');
    });

    it('enables the button when the stored cooldown already expired', async () => {
      vi.useFakeTimers();
      rememberResendCooldown(EMAIL);
      vi.advanceTimersByTime(300_000);

      renderWithQuery(<VerificationForm />);
      await tickSeconds(0);

      expect(resendButton()).toBeEnabled();
    });

    it('enables the button once the countdown runs out', async () => {
      vi.useFakeTimers();
      rememberResendCooldown(EMAIL);

      renderWithQuery(<VerificationForm />);
      await tickSeconds(60);

      expect(resendButton()).toBeEnabled();
      expect(resendButton()).toHaveTextContent('Reenviar código');
    });

    it('restarts the countdown from the seconds the API reports', async () => {
      resendCode.mockRejectedValue(
        apiError(429, 'Estás yendo muy rápido.', 42),
      );

      await renderPastCooldown();
      await userEvent.click(resendButton());

      await waitFor(() =>
        expect(resendButton()).toHaveTextContent(/Reenviar código en 4[12] s/),
      );
      expect(screen.getByText('Estás yendo muy rápido.')).toBeInTheDocument();
    });
  });

  describe('resend limit', () => {
    it('opens the popup once the resend allowance is spent', async () => {
      resendCode.mockRejectedValue(
        apiError(403, 'Alcanzaste el máximo de reenvíos.'),
      );

      await renderPastCooldown();
      await userEvent.click(resendButton());

      await waitFor(() =>
        expect(
          screen.getByText('Alcanzaste el máximo de reenvíos'),
        ).toBeInTheDocument(),
      );
    });

    it('confirms the send and restarts the countdown when it works', async () => {
      resendCode.mockResolvedValue({ message: 'ok' });

      await renderPastCooldown();
      await userEvent.click(resendButton());

      await waitFor(() =>
        expect(
          screen.getByText('Te enviamos un código nuevo.'),
        ).toBeInTheDocument(),
      );
      expect(resendButton()).toBeDisabled();
    });
  });
});
