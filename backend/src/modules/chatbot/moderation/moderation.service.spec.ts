import { ModerationService } from './moderation.service';

describe('ModerationService', () => {
  const service = new ModerationService();

  it('lets ordinary questions through', () => {
    expect(service.screen('hola, quien es mi match').blocked).toBe(false);
  });

  it('blocks clearly abusive Spanish input', () => {
    expect(service.screen('eres una puta').blocked).toBe(true);
  });

  it('blocks clearly abusive English input', () => {
    expect(service.screen('this is fuck').blocked).toBe(true);
  });

  it('ignores case', () => {
    expect(service.screen('BITCH').blocked).toBe(true);
  });

  it('does not block a word that merely contains a blocked substring', () => {
    expect(service.screen('disputa').blocked).toBe(false);
  });

  it('treats an empty message as clean', () => {
    expect(service.screen('').blocked).toBe(false);
  });
});
