import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async reportPartner(
    reporterId: string,
    matchId: string,
    dto: CreateReportDto,
  ) {
    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ userAId: reporterId }, { userBId: reporterId }],
      },
      select: { userAId: true, userBId: true },
    });
    if (!match) {
      throw new NotFoundException('Match not found.');
    }

    const reportedId =
      match.userAId === reporterId ? match.userBId : match.userAId;
    if (reportedId === reporterId) {
      throw new BadRequestException('You cannot report yourself.');
    }

    return this.prisma.report.upsert({
      where: { userAId_userBId: { userAId: reporterId, userBId: reportedId } },
      create: {
        userAId: reporterId,
        userBId: reportedId,
        reason: dto.reason ?? null,
      },
      update: { reason: dto.reason ?? null },
    });
  }
}
