import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GcsImageStore } from './gcs-image-store';
import { LocalImageStore } from './local-image-store';
import { createImageStore } from './storage.module';

jest.mock('@google-cloud/storage', () => ({
  Storage: jest.fn().mockImplementation(() => ({ bucket: jest.fn() })),
}));

function configWith(env: Record<string, string>): ConfigService {
  return { get: (key: string) => env[key] } as unknown as ConfigService;
}

describe('createImageStore', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores images in GCS when a bucket is configured', () => {
    const store = createImageStore(configWith({ GCS_BUCKET: 'mourly-media' }));

    expect(store).toBeInstanceOf(GcsImageStore);
  });

  it('falls back to local disk outside production', () => {
    const store = createImageStore(configWith({ NODE_ENV: 'development' }));

    expect(store).toBeInstanceOf(LocalImageStore);
  });

  it('refuses local disk in production, where the container disk is wiped on deploy', () => {
    expect(() =>
      createImageStore(configWith({ NODE_ENV: 'production' })),
    ).toThrow('GCS_BUCKET is required in production');
  });
});
