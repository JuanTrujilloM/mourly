import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { VerificationDeliveryService } from './verification-delivery.service';

@Injectable()
export class VerificationDispatcherService implements OnApplicationShutdown {
  private readonly logger = new Logger(VerificationDispatcherService.name);
  private readonly pending = new Set<Promise<void>>();

  constructor(private readonly delivery: VerificationDeliveryService) {}

  dispatch(userId: string, email: string): void {
    const task: Promise<void> = this.delivery
      .sendIfAllowed(userId, email)
      .catch((error: unknown) => this.logFailure(userId, error))
      .finally(() => this.pending.delete(task));
    this.pending.add(task);
  }

  async drain(): Promise<void> {
    await Promise.all([...this.pending]);
  }

  onApplicationShutdown(): Promise<void> {
    return this.drain();
  }

  private logFailure(userId: string, error: unknown): void {
    this.logger.error(
      `Verification delivery failed for user ${userId}`,
      error instanceof Error ? error.stack : String(error),
    );
  }
}
