import { BadRequestException } from '@nestjs/common';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  imageExtensionFor,
  isAllowedImageMimeType,
} from './image-upload.constants';
import { imageUploadOptions } from './image-upload.options';

type FileFilter = NonNullable<typeof imageUploadOptions.fileFilter>;

function runFilter(mimetype: string) {
  const callback = jest.fn();
  const filter = imageUploadOptions.fileFilter as FileFilter;
  filter(
    {} as Parameters<FileFilter>[0],
    { mimetype } as Express.Multer.File,
    callback,
  );
  return callback;
}

describe('image upload rules', () => {
  it('allows exactly jpeg, png and webp', () => {
    expect(ALLOWED_IMAGE_MIME_TYPES).toEqual([
      'image/jpeg',
      'image/png',
      'image/webp',
    ]);
  });

  it('recognizes an allowed mime type', () => {
    expect(isAllowedImageMimeType('image/png')).toBe(true);
    expect(isAllowedImageMimeType('image/svg+xml')).toBe(false);
  });

  it('maps each allowed mime type to a safe extension', () => {
    expect(imageExtensionFor('image/jpeg')).toBe('.jpg');
    expect(imageExtensionFor('image/png')).toBe('.png');
    expect(imageExtensionFor('image/webp')).toBe('.webp');
  });

  it('refuses to produce an extension for a disallowed type', () => {
    expect(() => imageExtensionFor('text/html')).toThrow(
      /Unsupported image mime type/,
    );
  });

  it('caps the upload size at 5 MB', () => {
    expect(MAX_IMAGE_BYTES).toBe(5 * 1024 * 1024);
    expect(imageUploadOptions.limits?.fileSize).toBe(MAX_IMAGE_BYTES);
  });

  it('caps the number of files at the photo limit', () => {
    expect(imageUploadOptions.limits?.files).toBe(5);
  });

  it('accepts an allowed image through the filter', () => {
    const callback = runFilter('image/jpeg');

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('rejects a disguised html upload through the filter', () => {
    const callback = runFilter('text/html');

    expect(callback.mock.calls[0][0]).toBeInstanceOf(BadRequestException);
    expect(callback.mock.calls[0][1]).toBe(false);
  });
});
