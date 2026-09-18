import { apiClient } from './client';
import type { AuthUser, VerifyPayload } from '@/types/auth';

export async function requestCode(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    '/auth/request-code',
    { email },
  );
  return data;
}

export async function verifyCode(payload: VerifyPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<{ user: AuthUser }>(
    '/auth/verify',
    payload,
  );
  return data.user;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/auth/me');
  return data;
}

export async function logout(): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/logout');
  return data;
}
