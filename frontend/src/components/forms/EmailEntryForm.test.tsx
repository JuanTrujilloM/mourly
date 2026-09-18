import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithQuery, routerPush } from '@/test-utils';
import {
  RESEND_COOLDOWN_SECONDS,
  UNSUPPORTED_UNIVERSITY_MESSAGE,
} from '@/lib/constants/auth';
import { remainingResendCooldown } from '@/lib/utils/resend-cooldown';
import * as authApi from '@/lib/api/auth';
import { EmailEntryForm } from './EmailEntryForm';

vi.mock('@/lib/api/auth');
vi.mock('@/lib/api/waitlist');

const requestCode = vi.mocked(authApi.requestCode);

const EMAIL = 'ana@eafit.edu.co';

function apiError(message: string): AxiosError {
  const error = new AxiosError('request failed');
  error.response = {
    data: { message: [message] },
    status: 400,
    statusText: 'Bad Request',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

async function submitEmail(value = EMAIL) {
  await userEvent.type(screen.getByLabelText('Correo institucional'), value);
  await userEvent.click(screen.getByRole('button', { name: 'Enviar código' }));
}

describe('EmailEntryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('sends the visitor to the verification step', async () => {
    requestCode.mockResolvedValue({ message: 'ok' });

    renderWithQuery(<EmailEntryForm />);
    await submitEmail();

    await waitFor(() => expect(requestCode.mock.calls[0]?.[0]).toBe(EMAIL));
    await waitFor(() =>
      expect(routerPush).toHaveBeenCalledWith(
        `/verify?email=${encodeURIComponent(EMAIL)}`,
      ),
    );
  });

  it('records the cooldown so a reload does not restart the countdown', async () => {
    requestCode.mockResolvedValue({ message: 'ok' });

    renderWithQuery(<EmailEntryForm />);
    await submitEmail();

    await waitFor(() =>
      expect(remainingResendCooldown(EMAIL)).toBe(RESEND_COOLDOWN_SECONDS),
    );
  });

  it('records no cooldown when the request failed', async () => {
    requestCode.mockRejectedValue(new Error('boom'));

    renderWithQuery(<EmailEntryForm />);
    await submitEmail();

    await waitFor(() =>
      expect(screen.getByText(/Algo salió mal/)).toBeInTheDocument(),
    );
    expect(remainingResendCooldown(EMAIL)).toBe(0);
  });

  it('offers the waitlist when the university is not supported yet', async () => {
    requestCode.mockRejectedValue(apiError(UNSUPPORTED_UNIVERSITY_MESSAGE));

    renderWithQuery(<EmailEntryForm />);
    await submitEmail('emaya@correo.iue.edu.co');

    await waitFor(() =>
      expect(screen.getByLabelText('Celular')).toBeInTheDocument(),
    );
    expect(screen.getAllByDisplayValue('emaya@correo.iue.edu.co')).toHaveLength(2);
    expect(routerPush).not.toHaveBeenCalled();
  });
});
