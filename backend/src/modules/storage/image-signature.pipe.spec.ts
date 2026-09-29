import { BadRequestException } from '@nestjs/common';
import { ImageSignaturePipe } from './image-signature.pipe';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function fileWith(mimetype: string, buffer: Buffer): Express.Multer.File {
  return { mimetype, buffer } as Express.Multer.File;
}

describe('ImageSignaturePipe', () => {
  const pipe = new ImageSignaturePipe();

  it('passes real images through untouched', () => {
    const files = [fileWith('image/png', PNG)];

    expect(pipe.transform(files)).toBe(files);
  });

  it('passes a request without files', () => {
    expect(pipe.transform(undefined)).toBeUndefined();
  });

  it('rejects a file whose bytes do not match its mime type', () => {
    const files = [
      fileWith('image/png', PNG),
      fileWith('image/jpeg', Buffer.from('<svg onload=alert(1)>')),
    ];

    expect(() => pipe.transform(files)).toThrow(BadRequestException);
  });
});
