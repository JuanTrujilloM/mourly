import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { AllExceptionsFilter } from './all-exceptions.filter';

function buildHost() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

function prismaError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('failed', {
    code,
    clientVersion: '7.8.0',
  });
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('passes an HttpException status and message through', () => {
    const { host, status, json } = buildHost();

    filter.catch(new ForbiddenException('Admin access required.'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Admin access required.',
    });
  });

  it('preserves the string array a validation pipe produces', () => {
    const { host, json } = buildHost();

    filter.catch(new BadRequestException(['name is required']), host);

    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['name is required'],
    });
  });

  it('keeps a plain string payload from an HttpException', () => {
    const { host, json } = buildHost();
    const exception = new ForbiddenException();
    jest.spyOn(exception, 'getResponse').mockReturnValue('nope');

    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.FORBIDDEN,
      message: 'nope',
    });
  });

  it('falls back to the exception message when the payload has none', () => {
    const { host, json } = buildHost();
    const exception = new ForbiddenException('boom');
    jest.spyOn(exception, 'getResponse').mockReturnValue({});

    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.FORBIDDEN,
      message: 'boom',
    });
  });

  it('maps a unique constraint violation to 409', () => {
    const { host, status, json } = buildHost();

    filter.catch(prismaError('P2002'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'That value is already in use.',
    });
  });

  it('maps a missing record to 404', () => {
    const { host, status } = buildHost();

    filter.catch(prismaError('P2025'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('maps a foreign key violation to 400', () => {
    const { host, status } = buildHost();

    filter.catch(prismaError('P2003'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('collapses an unmapped Prisma code into a generic 500', () => {
    const { host, status, json } = buildHost();

    filter.catch(prismaError('P9999'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong. Please try again.',
    });
  });

  it('never leaks the message of an unknown error', () => {
    const { host, status, json } = buildHost();

    filter.catch(new Error('connection string leaked'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong. Please try again.',
    });
  });

  it('logs a thrown non-error value without crashing', () => {
    const { host, status } = buildHost();

    filter.catch('a bare string', host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('logs the name and message when a stack is missing', () => {
    const { host } = buildHost();
    const error = new Error('no stack');
    error.stack = undefined;

    filter.catch(error, host);

    expect(Logger.prototype.error).toHaveBeenCalledWith('Error: no stack');
  });
});
