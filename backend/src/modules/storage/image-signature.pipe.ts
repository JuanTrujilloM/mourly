import { BadRequestException, PipeTransform } from '@nestjs/common';
import { matchesImageSignature } from './image-signature';

export class ImageSignaturePipe implements PipeTransform<
  Express.Multer.File[] | undefined
> {
  transform(files: Express.Multer.File[] | undefined) {
    const forged = (files ?? []).some(
      (file) => !matchesImageSignature(file.mimetype, file.buffer),
    );
    if (forged) {
      throw new BadRequestException('Only real JPG or PNG images are allowed.');
    }
    return files;
  }
}
