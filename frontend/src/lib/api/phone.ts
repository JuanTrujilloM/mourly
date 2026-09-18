import { apiClient } from './client';
import type { AuthUser } from '@/types/auth';

export async function updateCellphone(
  cellphone: string,
): Promise<{ cellphone: string }> {
  const { data } = await apiClient.patch<{ cellphone: string }>('/auth/phone', {
    cellphone,
  });
  return data;
}

export async function sendPhoneCode(): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/phone/send');
  return data;
}

export async function verifyPhoneCode(code: string): Promise<AuthUser> {
  const { data } = await apiClient.post<{ user: AuthUser }>(
    '/auth/phone/verify',
    { code },
  );
  return data.user;
}
