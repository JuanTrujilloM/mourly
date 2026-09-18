import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class UserLookupService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async isCellphoneVerifiedByAnother(
    cellphone: string,
    userId: string,
  ): Promise<boolean> {
    const owner = await this.prisma.user.findFirst({
      where: {
        cellphone,
        cellphoneVerifiedAt: { not: null },
        id: { not: userId },
      },
      select: { id: true },
    });
    return owner !== null;
  }
}
