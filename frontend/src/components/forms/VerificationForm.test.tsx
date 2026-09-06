import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithQuery, searchParams } from '@/test-utils';
import * as authApi from '@/lib/api/auth';
import { VerificationForm } from './VerificationForm';

const EMAIL = 'ana@eafit.edu.co';

vi.mock('@/lib/api/auth');

const verifyCode = vi.mocked(authApi.verifyCode);

async function submitCode() {
  await userEvent.type(screen.getByLabelText(/código/i), '123456');
  await userEvent.click(screen.getByRole('button', { name: 'Verificar' }));
}

describe('VerificationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParams.set('email', EMAIL);
  });

  afterEach(() => {
    searchParams.delete('email');
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
});
