import { toGsmText } from './gsm-text';

describe('toGsmText', () => {
  it('drops the accents that fall outside the GSM-7 alphabet', () => {
    expect(toGsmText('Andrés Vélez, sábado, Sofía, Gómez, Lucía, Úrsula')).toBe(
      'Andrés Vélez, sabado, Sofia, Gomez, Lucia, Ursula',
    );
  });

  it('keeps the letters GSM-7 already has', () => {
    expect(toGsmText('¿Qué tal, Iñaki? ¡Güero!')).toBe(
      '¿Qué tal, Iñaki? ¡Güero!',
    );
  });

  it('replaces the middle dot used in schedule labels', () => {
    expect(toGsmText('sáb 12 sep · 15:00')).toBe('sab 12 sep - 15:00');
  });
});
