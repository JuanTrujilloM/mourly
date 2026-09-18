import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_USER, renderWithQuery, routerPush, routerReplace } from '@/test-utils';
import { rememberResendCooldown } from '@/lib/utils/resend-cooldown';
import * as phoneApi from '@/lib/api/phone';
import type { AuthUser } from '@/types/auth';
import { PhoneVerificationForm } from './PhoneVerificationForm';

vi.mock('@/lib/api/phone');

const sendPhoneCode = vi.mocked(phoneApi.sendPhoneCode);
const verifyPhoneCode = vi.mocked(phoneApi.verifyPhoneCode);
const updateCellphone = vi.mocked(phoneApi.updateCellphone);

const PENDING_USER = { ...AUTH_USER, cellphoneVerified: false, onboardingCompleted: false };
const NEW_USER = { ...PENDING_USER, cellphone: null };

describe('PhoneVerificationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    sendPhoneCode.mockResolvedValue({ message: 'ok' });
  });

  it('asks for the number when the account has none', () => {
    renderWithQuery(<PhoneVerificationForm user={NEW_USER} />);

    expect(screen.getByLabelText('Celular')).toBeInTheDocument();
    expect(sendPhoneCode).not.toHaveBeenCalled();
  });

  it('saves the number, sends the code and moves to the code step', async () => {
    updateCellphone.mockResolvedValue({ cellphone: '+573001112233', cellphoneVerified: false });

    renderWithQuery(<PhoneVerificationForm user={NEW_USER} />);
    await userEvent.type(screen.getByLabelText('Celular'), '3001112233');
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() =>
      expect(updateCellphone.mock.calls[0]?.[0]).toBe('3001112233'),
    );
    expect(sendPhoneCode).toHaveBeenCalledTimes(1);
  });

  it('sends no SMS when the number comes back verified', async () => {
    updateCellphone.mockResolvedValue({ cellphone: '+573001112233', cellphoneVerified: true });
    const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
    client.setQueryData(['currentUser'], NEW_USER);

    renderWithQuery(<PhoneVerificationForm user={NEW_USER} />, client);
    await userEvent.type(screen.getByLabelText('Celular'), '3001112233');
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() =>
      expect(client.getQueryData<AuthUser>(['currentUser'])?.cellphoneVerified).toBe(true),
    );
    expect(sendPhoneCode).not.toHaveBeenCalled();
  });

  it('sends a code on arrival when a number is already pending', async () => {
    renderWithQuery(<PhoneVerificationForm user={PENDING_USER} />);

    await waitFor(() => expect(sendPhoneCode).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/por SMS al/)).toBeInTheDocument();
  });

  it('does not send again on arrival while the cooldown runs', () => {
    rememberResendCooldown(AUTH_USER.cellphone as string);

    renderWithQuery(<PhoneVerificationForm user={PENDING_USER} />);

    expect(sendPhoneCode).not.toHaveBeenCalled();
  });

  it('routes onward once the code is accepted', async () => {
    verifyPhoneCode.mockResolvedValue({ ...PENDING_USER, cellphoneVerified: true });

    renderWithQuery(<PhoneVerificationForm user={PENDING_USER} />);
    await userEvent.type(screen.getByLabelText(/código/i), '482913');
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }));

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith('/onboarding/perfil'));
  });

  it('skips the step when the number is already verified', async () => {
    renderWithQuery(<PhoneVerificationForm user={AUTH_USER} />);

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith('/dashboard'));
    expect(screen.queryByText(/por SMS/)).not.toBeInTheDocument();
  });
});
