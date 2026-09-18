import { smsOriginFrom } from './sms-origin';

describe('smsOriginFrom', () => {
  it('prefers a messaging service over a phone number', () => {
    expect(smsOriginFrom('MG1', '+15005550006')).toEqual({
      messagingServiceSid: 'MG1',
    });
  });

  it('falls back to the phone number', () => {
    expect(smsOriginFrom(undefined, '+15005550006')).toEqual({
      from: '+15005550006',
    });
  });

  it('treats empty values as unset', () => {
    expect(smsOriginFrom('', '')).toBeNull();
  });

  it('is null when nothing is configured', () => {
    expect(smsOriginFrom(undefined, undefined)).toBeNull();
  });
});
