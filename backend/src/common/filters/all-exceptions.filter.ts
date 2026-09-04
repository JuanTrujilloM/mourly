import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client';

type ErrorBody = { statusCode: number; message: string | string[] };

const SERVER_ERROR_THRESHOLD = 500;

const PRISMA_STATUS: Record<string, number> = {
  P2002: HttpStatus.CONFLICT,
  P2025: HttpStatus.NOT_FOUND,
  P2003: HttpStatus.BAD_REQUEST,
};

const PRISMA_MESSAGE: Record<string, string> = {
  P2002: 'That value is already in use.',
  P2025: 'The requested resource was not found.',
  P2003: 'The request references a resource that does not exist.',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toBody(exception);

    if (body.statusCode >= SERVER_ERROR_THRESHOLD) {
      this.logger.error(this.describe(exception));
    }
    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaError(exception);
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong. Please try again.',
    };
  }

  private fromHttpException(exception: HttpException): ErrorBody {
    const status = exception.getStatus();
    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { statusCode: status, message: payload };
    }
    const message = (payload as { message?: string | string[] }).message;
    return { statusCode: status, message: message ?? exception.message };
  }

  private fromPrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): ErrorBody {
    const status =
      PRISMA_STATUS[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      PRISMA_MESSAGE[exception.code] ??
      'Something went wrong. Please try again.';
    return { statusCode: status, message };
  }

  private describe(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.stack ?? `${exception.name}: ${exception.message}`;
    }
    return String(exception);
  }
}
