import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { TimeoutError, withTimeout } from '../../common/utils/with-timeout';
import { VerificationDeliveryService } from './verification-delivery.service';

const SHUTDOWN_DRAIN_TIMEOUT_MS = 15_000;

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

  async onApplicationShutdown(): Promise<void> {
    try {
      await withTimeout(this.drain(), SHUTDOWN_DRAIN_TIMEOUT_MS, 'Drain');
    } catch (error) {
      if (!(error instanceof TimeoutError)) throw error;
      this.logger.warn(
        `Shutting down with ${this.pending.size} verification deliveries still pending`,
      );
    }
  }

  private logFailure(userId: string, error: unknown): void {
    this.logger.error(
      `Verification delivery failed for user ${userId}`,
      error instanceof Error ? error.stack : String(error),
    );
  }
}
