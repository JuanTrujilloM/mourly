import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

const DATABASE_UNREACHABLE_MESSAGE = 'Database unreachable.';

export interface HealthStatus {
  status: 'ok';
  service: string;
  timestamp: string;
  database: 'connected';
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthStatus> {
    await this.pingDatabase();
    return {
      status: 'ok',
      service: 'mourly-api',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  }

  private async pingDatabase(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException(DATABASE_UNREACHABLE_MESSAGE);
    }
  }
}
