import { describe, it, expect } from 'vitest';
import { selectPortugueseVoice, applyPortugueseVoice } from '@/lib/tts-voice';

type V = { lang?: string; name?: string };

const voices: V[] = [
  { lang: 'en-US', name: 'Google US English' },
  { lang: 'pt-BR', name: 'Microsoft Maria - Portuguese (Brazil)' },
  { lang: 'pt-PT', name: 'Microsoft Joana - Portuguese (Portugal)' },
  { lang: 'es-ES', name: 'Google español' },
];

describe('selectPortugueseVoice', () => {
  it('returns null when no voices are provided', () => {
    expect(selectPortugueseVoice(undefined)).toBeNull();
    expect(selectPortugueseVoice(null)).toBeNull();
    expect(selectPortugueseVoice([])).toBeNull();
  });

  it('returns null when there are no Portuguese voices', () => {
    expect(selectPortugueseVoice([{ lang: 'en-US' }, { lang: 'es-ES' }])).toBeNull();
  });

  it('prefers European Portuguese over Brazilian', () => {
    const result = selectPortugueseVoice(voices);
    expect(result?.lang).toBe('pt-PT');
    expect(result?.name).toContain('Portugal');
  });

  it('falls back to a non-Brazilian Portuguese voice when no explicit European voice exists', () => {
    const mixed: V[] = [
      { lang: 'pt-BR', name: 'Google brasileiro' },
      { lang: 'pt', name: 'Generic Portuguese' },
    ];
    const result = selectPortugueseVoice(mixed);
    expect(result?.lang).toBe('pt');
  });

  it('returns the Brazilian voice when European is not preferred', () => {
    const result = selectPortugueseVoice(voices, { preferEuropean: false });
    expect(result?.lang).toBe('pt-BR');
  });

  it('detects European Portuguese by name when lang is not explicit', () => {
    const named: V[] = [
      { lang: 'pt', name: 'European Portuguese' },
      { lang: 'pt', name: 'Brazilian Portuguese' },
    ];
    const result = selectPortugueseVoice(named);
    expect(result?.name).toBe('European Portuguese');
  });
});

describe('applyPortugueseVoice', () => {
  it('sets the language and resolves a matching voice', () => {
    const utterance: { lang?: string; voice?: unknown } = {};
    applyPortugueseVoice(utterance, voices);
    expect(utterance.lang).toBe('pt-PT');
    expect((utterance.voice as V)?.lang).toBe('pt-PT');
  });

  it('falls back to language only when no Portuguese voice exists', () => {
    const utterance: { lang?: string; voice?: unknown } = {};
    applyPortugueseVoice(utterance, [{ lang: 'fr-FR' }]);
    expect(utterance.lang).toBe('pt-PT');
    expect(utterance.voice).toBeUndefined();
  });
});
