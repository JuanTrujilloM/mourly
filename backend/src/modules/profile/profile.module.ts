import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfilePhotosService } from './profile-photos.service';

@Module({
  imports: [StorageModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfilePhotosService],
})
export class ProfileModule {}
