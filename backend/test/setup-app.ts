import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { ThrottlerGuard } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/config/prisma.service';

export const TEST_JWT_SECRET = 'test-secret-long-enough-for-validation-0123';

export type PrismaMock = Record<string, Record<string, jest.Mock>> & {
  $transaction: jest.Mock;
  $queryRaw: jest.Mock;
  $connect: jest.Mock;
};

const MODEL_NAMES = [
  'user',
  'profile',
  'preferences',
  'photo',
  'hobby',
  'profileHobby',
  'match',
  'date',
  'venue',
  'venueOption',
  'availability',
  'availabilityLink',
  'emailVerificationCode',
  'refreshToken',
  'feedback',
  'report',
  'university',
];

const MODEL_METHODS = [
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findMany',
  'create',
  'createMany',
  'update',
  'updateMany',
  'upsert',
  'delete',
  'deleteMany',
  'count',
];

export const TEST_UNIVERSITIES = [
  {
    id: 'uni_eafit',
    domain: 'eafit.edu.co',
    name: 'EAFIT',
    city: 'Medellín',
    active: true,
  },
  {
    id: 'uni_ces',
    domain: 'ces.edu.co',
    name: 'CES',
    city: 'Medellín',
    active: true,
  },
];

export function buildPrismaMock(): PrismaMock {
  const mock = {
    $transaction: jest.fn((argument: unknown) =>
      typeof argument === 'function'
        ? (argument as (client: unknown) => unknown)(mock)
        : Promise.all(argument as Promise<unknown>[]),
    ),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    $connect: jest.fn().mockResolvedValue(undefined),
  } as PrismaMock;

  for (const model of MODEL_NAMES) {
    mock[model] = Object.fromEntries(
      MODEL_METHODS.map((method) => [method, jest.fn()]),
    );
    mock[model].findMany.mockResolvedValue([]);
    mock[model].findUnique.mockResolvedValue(null);
    mock[model].findFirst.mockResolvedValue(null);
    mock[model].count.mockResolvedValue(0);
    mock[model].createMany.mockResolvedValue({ count: 0 });
    mock[model].deleteMany.mockResolvedValue({ count: 0 });
    mock[model].updateMany.mockResolvedValue({ count: 0 });
  }

  mock.university.findMany.mockResolvedValue(TEST_UNIVERSITIES);
  mock.university.findUnique.mockImplementation(
    ({ where }: { where: { domain?: string; id?: string } }) =>
      Promise.resolve(
        TEST_UNIVERSITIES.find(
          (university) =>
            university.domain === where.domain || university.id === where.id,
        ) ?? null,
      ),
  );
  return mock;
}

export interface TestApp {
  app: INestApplication;
  prisma: PrismaMock;
  close: () => Promise<void>;
  accessCookie: (userId: string, email: string) => Promise<string>;
}

export async function createTestApp(
  options: { throttle?: boolean; adminEmails?: string } = {},
): Promise<TestApp> {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.NODE_ENV = 'test';
  process.env.ADMIN_EMAILS = options.adminEmails ?? 'admin@eafit.edu.co';
  process.env.SMTP_HOST = '';

  const prisma = buildPrismaMock();
  const builder = Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue(prisma);

  if (!options.throttle) {
    builder.overrideGuard(ThrottlerGuard).useValue({ canActivate: () => true });
  }

  const moduleRef: TestingModule = await builder.compile();
  const app = moduleRef.createNestApplication();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();

  const jwt = app.get(JwtService);
  const accessCookie = async (userId: string, email: string) => {
    const token = await jwt.signAsync(
      { sub: userId, email },
      { expiresIn: '15m' },
    );
    return `access_token=${token}`;
  };

  return { app, prisma, close: () => app.close(), accessCookie };
}
