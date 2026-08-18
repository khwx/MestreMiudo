/**
 * @fileOverview Text-to-speech voice selection helpers.
 * Ensures quiz questions are read with a proper European Portuguese (pt-PT)
 * voice whenever one is available, improving the audio support for children.
 */

interface VoiceLike {
  lang?: string;
  name?: string;
}

function isEuropeanPortuguese(voice: VoiceLike): boolean {
  const lang = voice.lang?.toLowerCase() ?? '';
  if (lang === 'pt-pt') return true;
  return /portugal|european|euro/i.test(voice.name ?? '');
}

function isBrazilianPortuguese(voice: VoiceLike): boolean {
  const lang = voice.lang?.toLowerCase() ?? '';
  if (lang === 'pt-br') return true;
  return /brazil|brasil/i.test(voice.name ?? '');
}

/**
 * Select the best Portuguese voice from the list of available voices.
 * When preferEuropean is true (default), European Portuguese (pt-PT) voices
 * are preferred over Brazilian (pt-BR) ones, matching the project's target
 * audience in Portugal. Returns null when no Portuguese voice is available.
 */
export function selectPortugueseVoice(
  voices: VoiceLike[] | undefined | null,
  options: { preferEuropean?: boolean } = {}
): VoiceLike | null {
  if (!voices || voices.length === 0) return null;

  const preferEuropean = options.preferEuropean ?? true;
  const ptVoices = voices.filter((v) => v.lang?.toLowerCase().startsWith('pt'));
  if (ptVoices.length === 0) return null;

  if (preferEuropean) {
    const european = ptVoices.filter(isEuropeanPortuguese);
    if (european.length > 0) return european[0];

    const nonBrazilian = ptVoices.filter((v) => !isBrazilianPortuguese(v));
    if (nonBrazilian.length > 0) return nonBrazilian[0];
  }

  return ptVoices[0];
}

/**
 * Apply the best available Portuguese voice to a speech utterance.
 * Falls back gracefully to just setting the language when no matching
 * voice can be resolved (e.g. server-side or unsupported environments).
 */
export function applyPortugueseVoice(
  utterance: { lang?: string; voice?: unknown },
  voices?: VoiceLike[] | null
): void {
  utterance.lang = 'pt-PT';
  const voice = selectPortugueseVoice(voices);
  if (voice) {
    utterance.voice = voice;
  }
}
