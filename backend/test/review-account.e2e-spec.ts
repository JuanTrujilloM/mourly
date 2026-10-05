import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { Server } from 'http';
import { CODE_SENT_MESSAGE } from '../src/modules/auth/auth.messages';
import { VerificationDispatcherService } from '../src/modules/auth/verification-dispatcher.service';
import { MailService } from '../src/modules/mail/mail.service';
import { UNSUPPORTED_UNIVERSITY_MESSAGE } from '../src/modules/universities/university-messages';
import { createTestApp, type TestApp } from './setup-app';

const REVIEW_EMAIL = 'revision@mourly.com';
const REVIEW_CODE = '482913';

describe('Review account entry (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    process.env.REVIEW_ACCOUNT_EMAIL = REVIEW_EMAIL;
    process.env.REVIEW_ACCOUNT_CODE = REVIEW_CODE;
    context = await createTestApp();
  });

  afterAll(async () => {
    delete process.env.REVIEW_ACCOUNT_EMAIL;
    delete process.env.REVIEW_ACCOUNT_CODE;
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.user.upsert.mockResolvedValue({
      id: 'u-review',
      email: REVIEW_EMAIL,
    });
    context.prisma.emailVerificationCode.findFirst.mockResolvedValue(null);
  });

  const server = () => context.app.getHttpServer() as Server;
  const requestCode = (email: string) =>
    request(server()).post('/auth/request-code').send({ email });

  it('stores the fixed code for the review email and mails nothing', async () => {
    const mail = jest.spyOn(
      context.app.get(MailService),
      'sendVerificationCode',
    );

    const response = await requestCode(REVIEW_EMAIL).expect(200);

    await context.app.get(VerificationDispatcherService).drain();
    expect(response.body).toEqual({ message: CODE_SENT_MESSAGE });
    const [{ data }] = context.prisma.emailVerificationCode.create.mock
      .calls[0] as [{ data: { codeHash: string } }];
    expect(bcrypt.compareSync(REVIEW_CODE, data.codeHash)).toBe(true);
    expect(mail).not.toHaveBeenCalled();
  });

  it('still turns away any other address on the same domain', async () => {
    const response = await requestCode('otro@mourly.com').expect(400);

    expect(response.body.message).toContain(UNSUPPORTED_UNIVERSITY_MESSAGE);
    expect(context.prisma.user.upsert).not.toHaveBeenCalled();
  });
});
