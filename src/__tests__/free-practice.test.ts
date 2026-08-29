import { describe, it, expect } from 'vitest';
import {
  shouldSkipSaving,
  buildFreePracticeBannerText,
  buildFreePracticeResultMessage,
  buildFreePracticeResultTitle,
} from '@/lib/free-practice';

describe('free-practice helpers', () => {
  it('should skip saving when free practice is enabled', () => {
    expect(shouldSkipSaving(true)).toBe(true);
  });

  it('should NOT skip saving when free practice is disabled', () => {
    expect(shouldSkipSaving(false)).toBe(false);
    expect(shouldSkipSaving(undefined as unknown as boolean)).toBe(false);
  });

  it('returns a banner text that mentions no points are saved', () => {
    const text = buildFreePracticeBannerText();
    expect(text).toContain('Treino Livre');
    expect(text.toLowerCase()).toContain('sem guardar pontos');
  });

  it('returns a result message clarifying nothing was saved', () => {
    const text = buildFreePracticeResultMessage();
    expect(text).toContain('não guardámos pontos');
  });

  it('returns a treino livre result title', () => {
    expect(buildFreePracticeResultTitle()).toBe('Treino Livre Concluído!');
  });
});
