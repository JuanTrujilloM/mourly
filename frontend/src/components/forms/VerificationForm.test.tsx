import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_USER, renderWithQuery, routerPush, searchParams } from '@/test-utils';
import * as authApi from '@/lib/api/auth';
import { rememberResendCooldown } from '@/lib/utils/resend-cooldown';
import { hasSpentResends, recordResend } from '@/lib/utils/resend-allowance';
import { VerificationForm } from './VerificationForm';

const EMAIL = 'ana@eafit.edu.co';

vi.mock('@/lib/api/auth');

const verifyCode = vi.mocked(authApi.verifyCode);
const requestCode = vi.mocked(authApi.requestCode);

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

  it('confirms the code went to the given email', () => {
    renderWithQuery(<VerificationForm />);

    expect(screen.getByText(/Te enviamos un código de 6 dígitos/)).toBeInTheDocument();
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
  });

  it('shows the API message when the code is rejected', async () => {
    verifyCode.mockRejectedValue(apiError(400, 'El código es incorrecto o expiró.'));

    renderWithQuery(<VerificationForm />);
    await submitCode();

    await waitFor(() =>
      expect(screen.getByText('El código es incorrecto o expiró.')).toBeInTheDocument(),
    );
  });

  it('sends a fresh account to the cellphone step', async () => {
    verifyCode.mockResolvedValue({ ...AUTH_USER, cellphoneVerified: false, onboardingCompleted: false });

    renderWithQuery(<VerificationForm />);
    await submitCode();

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith('/onboarding/celular'));
  });

  it('sends a complete account to the dashboard', async () => {
    verifyCode.mockResolvedValue(AUTH_USER);

    renderWithQuery(<VerificationForm />);
    await submitCode();

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith('/dashboard'));
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
      requestCode.mockRejectedValue(
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
    it('opens the popup without asking the API once the allowance is spent', async () => {
      requestCode.mockResolvedValue({ message: 'ok' });
      for (let index = 0; index < 3; index += 1) recordResend(EMAIL);

      await renderPastCooldown();
      await userEvent.click(resendButton());

      await waitFor(() =>
        expect(
          screen.getByText('Alcanzaste el máximo de reenvíos'),
        ).toBeInTheDocument(),
      );
      expect(requestCode).not.toHaveBeenCalled();
    });

    it('counts a successful resend toward the allowance', async () => {
      requestCode.mockResolvedValue({ message: 'ok' });
      recordResend(EMAIL);
      recordResend(EMAIL);

      await renderPastCooldown();
      await userEvent.click(resendButton());

      await waitFor(() => expect(hasSpentResends(EMAIL)).toBe(true));
    });

    it('confirms the send and restarts the countdown when it works', async () => {
      requestCode.mockResolvedValue({ message: 'ok' });

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
