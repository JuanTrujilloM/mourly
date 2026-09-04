import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappSenderService {
  private readonly logger = new Logger(WhatsappSenderService.name);
  private readonly devMode: boolean;

  constructor(config: ConfigService) {
    this.devMode = !config.get<string>('WHATSAPP_TOKEN');
  }

  send(cellphone: string, text: string): Promise<void> {
    if (this.devMode) {
      this.logger.warn(
        `[dev whatsapp] to ${cellphone}: ${text} (WHATSAPP_TOKEN not configured)`,
      );
      return Promise.resolve();
    }

    this.logger.log(`Sending WhatsApp message to ${cellphone}`);
    return Promise.resolve();
  }
}
