import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMAGE_STORE, type ImageStore } from './image-store';
import { LocalImageStore } from './local-image-store';
import { S3ImageStore } from './s3-image-store';
import { StorageService } from './storage.service';

function createImageStore(config: ConfigService): ImageStore {
  const bucket = config.get<string>('AWS_S3_BUCKET');
  const region = config.get<string>('AWS_REGION');

  if (bucket && region) {
    return new S3ImageStore(bucket, region);
  }
  new Logger(StorageModule.name).warn(
    'S3 is not configured; images are saved to local disk (/uploads).',
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
