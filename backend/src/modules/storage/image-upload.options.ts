import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { MAX_PHOTOS } from '../profile/constants/profile-options';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  isAllowedImageMimeType,
} from './image-upload.constants';

export const imageUploadOptions: MulterOptions = {
  limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_PHOTOS },
  fileFilter: (_request, file, callback) => {
    if (!isAllowedImageMimeType(file.mimetype)) {
      callback(
        new BadRequestException(
          `Only ${ALLOWED_IMAGE_MIME_TYPES.join(', ')} images are allowed.`,
        ),
        false,
      );
      return;
    }
    callback(null, true);
  },
};
