import 'dotenv/config';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { ServerResponse } from 'http';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

const DEFAULT_PORT = 3000;
const DEFAULT_FRONTEND_URL = 'http://localhost:3000';
const UPLOADS_DIRECTORY = 'uploads';
const UPLOADS_PREFIX = '/uploads/';

function hardenStaticHeaders(response: ServerResponse): void {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Content-Security-Policy', "default-src 'none'");
  response.setHeader('Content-Disposition', 'inline');
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());
  app.useStaticAssets(join(process.cwd(), UPLOADS_DIRECTORY), {
    prefix: UPLOADS_PREFIX,
    setHeaders: hardenStaticHeaders,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? DEFAULT_FRONTEND_URL,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}

void bootstrap();
