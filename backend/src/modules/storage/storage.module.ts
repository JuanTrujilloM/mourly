import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMAGE_STORE, type ImageStore } from './image-store';
import { LocalImageStore } from './local-image-store';
import { GcsImageStore } from './gcs-image-store';
import { StorageService } from './storage.service';

export function createImageStore(config: ConfigService): ImageStore {
  const bucket = config.get<string>('GCS_BUCKET');
  if (bucket) {
    return new GcsImageStore(bucket);
  }
  if (config.get<string>('NODE_ENV') === 'production') {
    throw new Error('GCS_BUCKET is required in production');
  }
  new Logger(StorageModule.name).warn(
    'GCS is not configured; images are saved to local disk (/uploads).',
  );
  return new LocalImageStore(config);
}

@Module({
  providers: [
    StorageService,
    {
      provide: IMAGE_STORE,
      inject: [ConfigService],
      useFactory: createImageStore,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
