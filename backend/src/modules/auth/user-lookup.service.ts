import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class UserLookupService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async isCellphoneTaken(
    cellphone: string,
    ownerId?: string,
  ): Promise<boolean> {
    const owner = await this.prisma.user.findUnique({ where: { cellphone } });
    return owner !== null && owner.id !== ownerId;
  }
}
