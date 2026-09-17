import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailService } from './mail.service';

export function setupMailService(env: Record<string, string> = {}) {
  const send = jest
    .fn()
    .mockResolvedValue({ data: { id: 'email_1' }, error: null });
  (Resend as jest.MockedClass<typeof Resend>).mockImplementation(
    () => ({ emails: { send } }) as unknown as Resend,
  );

  const config = {
    get: (key: string, fallback?: string) => env[key] ?? fallback,
  } as unknown as ConfigService;

  return { service: new MailService(config), send };
}
