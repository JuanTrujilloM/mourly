import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsoleSmsSender } from './console-sms-sender';
import { smsOriginFrom } from './sms-origin';
import { SMS_SENDER, type SmsSender } from './sms-sender';
import { TwilioSmsSender } from './twilio-sms-sender';

const CONSOLE_FALLBACK_NOTICE =
  'Twilio is not configured; SMS messages are logged to the console.';

function createSmsSender(config: ConfigService): SmsSender {
  const accountSid = config.get<string>('TWILIO_ACCOUNT_SID');
  const authToken = config.get<string>('TWILIO_AUTH_TOKEN');
  const origin = smsOriginFrom(
    config.get<string>('TWILIO_MESSAGING_SERVICE_SID'),
    config.get<string>('TWILIO_FROM'),
  );

  if (accountSid && authToken && origin) {
    return new TwilioSmsSender(accountSid, authToken, origin);
  }
  new Logger(SmsModule.name).warn(CONSOLE_FALLBACK_NOTICE);
  return new ConsoleSmsSender();
}

@Module({
  providers: [
    {
      provide: SMS_SENDER,
      inject: [ConfigService],
      useFactory: createSmsSender,
    },
  ],
  exports: [SMS_SENDER],
})
export class SmsModule {}
