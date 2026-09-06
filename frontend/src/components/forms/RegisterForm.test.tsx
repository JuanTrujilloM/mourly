import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithQuery, routerPush } from '@/test-utils';
import { UNSUPPORTED_UNIVERSITY_MESSAGE } from '@/lib/constants/auth';
import * as authApi from '@/lib/api/auth';
import * as waitlistApi from '@/lib/api/waitlist';
import { RegisterForm } from './RegisterForm';

vi.mock('@/lib/api/auth');
vi.mock('@/lib/api/waitlist');

const register = vi.mocked(authApi.register);
const joinWaitlist = vi.mocked(waitlistApi.joinWaitlist);

const EMAIL = 'emaya@correo.iue.edu.co';
const CELLPHONE = '+573014983968';

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

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText('Correo institucional'), EMAIL);
  await userEvent.type(screen.getByLabelText('Celular'), CELLPHONE);
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends a supported student to the verification step', async () => {
    register.mockResolvedValue({ message: 'ok' });

    renderWithQuery(<RegisterForm />);
    await fillAndSubmit();

    await waitFor(() =>
      expect(routerPush).toHaveBeenCalledWith(
        `/verify?email=${encodeURIComponent(EMAIL)}`,
      ),
    );
  });

  it('offers the waitlist when the university is not supported yet', async () => {
    register.mockRejectedValue(apiError(UNSUPPORTED_UNIVERSITY_MESSAGE));

    renderWithQuery(<RegisterForm />);
    await fillAndSubmit();

    expect(
      await screen.findByRole('button', { name: 'Avisame cuando abran' }),
    ).toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('carries the typed email and cellphone into the waitlist form', async () => {
    register.mockRejectedValue(apiError(UNSUPPORTED_UNIVERSITY_MESSAGE));
    joinWaitlist.mockResolvedValue({ message: 'Listo.' });

    renderWithQuery(<RegisterForm />);
    await fillAndSubmit();

    await userEvent.type(await screen.findByLabelText('Nombre'), 'Emmanuel');
    await userEvent.click(
      screen.getByRole('button', { name: 'Avisame cuando abran' }),
    );

    await waitFor(() => expect(joinWaitlist).toHaveBeenCalled());
    expect(joinWaitlist.mock.calls[0][0]).toEqual({
      name: 'Emmanuel',
      email: EMAIL,
      cellphone: CELLPHONE,
    });
    expect(await screen.findByText('Listo.')).toBeInTheDocument();
  });

  it('shows any other failure inline instead of the waitlist', async () => {
    register.mockRejectedValue(apiError('El celular ya está en uso.'));

    renderWithQuery(<RegisterForm />);
    await fillAndSubmit();

    expect(
      await screen.findByText('El celular ya está en uso.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Avisame cuando abran' }),
    ).not.toBeInTheDocument();
  });
});
