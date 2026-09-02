import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const REFRESH_PATH = '/auth/refresh';

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshing: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  refreshing ??= apiClient
    .post(REFRESH_PATH)
    .then(() => undefined)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const isAuthFailure = error.response?.status === 401;
    const isRefreshCall = original?.url?.includes(REFRESH_PATH);

    if (!original || !isAuthFailure || isRefreshCall || original._retried) {
      return Promise.reject(error);
    }

    original._retried = true;
    try {
      await refreshSession();
    } catch {
      return Promise.reject(error);
    }
    return apiClient.request(original);
  },
);
