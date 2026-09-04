import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './errors';

function axiosErrorWith(data: unknown): AxiosError {
  const error = new AxiosError('request failed');
  error.response = {
    data,
    status: 400,
    statusText: 'Bad Request',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('getApiErrorMessage', () => {
  it('uses a plain string message from the API', () => {
    expect(getApiErrorMessage(axiosErrorWith({ message: 'Correo inválido.' }))).toBe(
      'Correo inválido.',
    );
  });

  it('uses the first entry of a validation message list', () => {
    expect(
      getApiErrorMessage(axiosErrorWith({ message: ['Falta el nombre.', 'Otro'] })),
    ).toBe('Falta el nombre.');
  });

  it('falls back when the message list is empty', () => {
    expect(getApiErrorMessage(axiosErrorWith({ message: [] }))).toBe(
      'Algo salió mal. Intentá de nuevo.',
    );
  });

  it('falls back when the response carries no message', () => {
    expect(getApiErrorMessage(axiosErrorWith({}))).toBe(
      'Algo salió mal. Intentá de nuevo.',
    );
  });

  it('falls back for a non axios error', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe(
      'Algo salió mal. Intentá de nuevo.',
    );
  });

  it('honors a custom fallback', () => {
    expect(getApiErrorMessage(null, 'No se pudo guardar.')).toBe(
      'No se pudo guardar.',
    );
  });
});
