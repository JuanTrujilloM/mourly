import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { RegistrationService } from './registration.service';
import { UserLookupService } from './user-lookup.service';
import { UniversitiesService } from '../universities/universities.service';
import { VerificationCodeService } from './verification-code.service';
import { VerificationDeliveryService } from './verification-delivery.service';
import { NEUTRAL_MESSAGE } from './auth.messages';

const VALID_DTO = {
  email: 'Ana@EAFIT.edu.co',
  cellphone: '+573001112233',
};

function setup() {
  const create = jest.fn().mockResolvedValue({ id: 'new-user' });
  const update = jest.fn().mockResolvedValue({ id: 'existing-user' });
  const prisma = { user: { create, update } } as unknown as PrismaService;

  const codes = { hasVerifiedEmail: jest.fn().mockResolvedValue(false) };
  const delivery = {
    send: jest.fn().mockResolvedValue(undefined),
    sendIfCooldownElapsed: jest.fn().mockResolvedValue(undefined),
  };
  const users = {
    findByEmail: jest.fn().mockResolvedValue(null),
    isCellphoneTaken: jest.fn().mockResolvedValue(false),
  };
  const universities = { isSupportedEmail: jest.fn().mockResolvedValue(true) };

  const service = new RegistrationService(
    prisma,
    codes as unknown as VerificationCodeService,
    delivery as unknown as VerificationDeliveryService,
    users as unknown as UserLookupService,
    universities as unknown as UniversitiesService,
  );
  return { service, codes, delivery, users, universities, create, update };
}

describe('RegistrationService', () => {
  it('creates the user, normalizes the email and sends a code', async () => {
    const { service, create, delivery } = setup();

    const result = await service.register(VALID_DTO);

    expect(create).toHaveBeenCalledWith({
      data: { email: 'ana@eafit.edu.co', cellphone: '+573001112233' },
    });
    expect(delivery.send).toHaveBeenCalledWith('new-user', 'ana@eafit.edu.co');
    expect(result).toEqual({ message: NEUTRAL_MESSAGE });
  });

  it('rejects an email outside the supported universities', async () => {
    const { service, universities } = setup();
    universities.isSupportedEmail.mockResolvedValue(false);

    await expect(
      service.register({ ...VALID_DTO, email: 'ana@gmail.com' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates the cellphone of an existing unverified signup', async () => {
    const { service, users, update, create } = setup();
    users.findByEmail.mockResolvedValue({ id: 'existing-user' });

    await service.register(VALID_DTO);

    expect(update).toHaveBeenCalledWith({
      where: { id: 'existing-user' },
      data: { cellphone: '+573001112233' },
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('answers neutrally for an already verified account without touching it', async () => {
    const { service, users, codes, update, create, delivery } = setup();
    users.findByEmail.mockResolvedValue({ id: 'verified-user' });
    codes.hasVerifiedEmail.mockResolvedValue(true);

    const result = await service.register(VALID_DTO);

    expect(result).toEqual({ message: NEUTRAL_MESSAGE });
    expect(update).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(delivery.sendIfCooldownElapsed).toHaveBeenCalledWith(
      'verified-user',
      'ana@eafit.edu.co',
    );
  });

  it('answers neutrally when the cellphone belongs to someone else', async () => {
    const { service, users, create, delivery } = setup();
    users.isCellphoneTaken.mockResolvedValue(true);

    const result = await service.register(VALID_DTO);

    expect(result).toEqual({ message: NEUTRAL_MESSAGE });
    expect(create).not.toHaveBeenCalled();
    expect(delivery.send).not.toHaveBeenCalled();
  });

  it('gives the same message whether or not the account exists', async () => {
    const fresh = setup();
    const existing = setup();
    existing.users.findByEmail.mockResolvedValue({ id: 'verified-user' });
    existing.codes.hasVerifiedEmail.mockResolvedValue(true);

    expect(await fresh.service.register(VALID_DTO)).toEqual(
      await existing.service.register(VALID_DTO),
    );
  });
});
