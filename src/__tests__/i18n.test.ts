import { describe, it, expect } from 'vitest';
import { getTranslation, translations, type Locale } from '@/lib/i18n/translations';

describe('i18n translations', () => {
  it('returns the pt-PT value by default', () => {
    expect(getTranslation('pt-PT', 'common.save')).toBe('Guardar');
  });

  it('returns the pt-BR adapted value', () => {
    expect(getTranslation('pt-BR', 'common.save')).toBe('Salvar');
    expect(getTranslation('pt-BR', 'common.delete')).toBe('Excluir');
    expect(getTranslation('pt-BR', 'common.password')).toBe('Senha');
    expect(getTranslation('pt-BR', 'common.share')).toBe('Compartilhar');
  });

  it('falls back to pt-PT when the locale has no translation', () => {
    expect(getTranslation('pt-BR', 'common.back')).toBe('Voltar');
  });

  it('falls back to the key when neither locale has the key', () => {
    expect(getTranslation('pt-PT', 'does.not.exist')).toBe('does.not.exist');
  });

  it('interpolates params', () => {
    const result = getTranslation('pt-PT', 'dashboard.hello', { name: 'Ana' });
    expect(result).toBe('Olá, Ana! 👋');
  });

  it('keeps the placeholder when a param is missing', () => {
    const result = getTranslation('pt-PT', 'dashboard.hello', {});
    expect(result).toBe('Olá, {name}! 👋');
  });

  it('both locales define the same set of keys', () => {
    const ptPT = Object.keys(translations['pt-PT']).sort();
    const ptBR = Object.keys(translations['pt-BR']).sort();
    expect(ptBR).toEqual(ptPT);
  });

  it('supports only the declared locales', () => {
    const locales: Locale[] = ['pt-PT', 'pt-BR'];
    expect(locales).toEqual(Object.keys(translations) as Locale[]);
  });
});
