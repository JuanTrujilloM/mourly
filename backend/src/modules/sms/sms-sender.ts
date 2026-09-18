export const SMS_SENDER = Symbol('SMS_SENDER');

export interface SmsSender {
  send(to: string, body: string): Promise<void>;
}
