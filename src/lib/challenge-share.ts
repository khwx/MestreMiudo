// Lógica pura e testável para o modo "Desafio entre amigos".
// Permite codificar um resultado de quiz numa ligação partilhável e
// construir a mensagem de desafio em português (pt-PT).

export type QuizChallenge = {
  from: string;
  subject: 'Português' | 'Matemática' | 'Estudo do Meio' | 'Misto';
  grade: number;
  score: number;
  total: number;
  stars: number;
};

const SUBJECT_TO_SLUG: Record<QuizChallenge['subject'], string> = {
  Português: 'portugues',
  Matemática: 'matematica',
  'Estudo do Meio': 'estudo-do-meio',
  Misto: 'misto',
};

export function subjectToSlug(subject: QuizChallenge['subject']): string {
  return SUBJECT_TO_SLUG[subject] ?? 'misto';
}

export function starsForScore(score: number, total: number): number {
  if (total <= 0) return 0;
  if (score === total) return 3;
  if (score >= total * 0.6) return 2;
  return 1;
}

function utf8ToBase64Url(input: string): string {
  const utf8 = new TextEncoder().encode(input);
  let binary = '';
  utf8.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUtf8(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Codifica o desafio numa string segura para URL (base64url de JSON).
export function encodeChallenge(data: QuizChallenge): string {
  return utf8ToBase64Url(JSON.stringify(data));
}

// Descodifica uma ligação de desafio. Devolve null se for inválida/corrompida.
export function decodeChallenge(encoded: string | null | undefined): QuizChallenge | null {
  if (!encoded || typeof encoded !== 'string') return null;
  try {
    const json = base64UrlToUtf8(encoded);
    const data = JSON.parse(json) as Partial<QuizChallenge>;
    if (
      typeof data.from !== 'string' ||
      typeof data.subject !== 'string' ||
      typeof data.grade !== 'number' ||
      typeof data.score !== 'number' ||
      typeof data.total !== 'number' ||
      typeof data.stars !== 'number'
    ) {
      return null;
    }
    return {
      from: data.from,
      subject: data.subject as QuizChallenge['subject'],
      grade: data.grade,
      score: data.score,
      total: data.total,
      stars: data.stars,
    };
  } catch {
    return null;
  }
}

// Constrói a mensagem divertida de desafio em pt-PT.
export function buildChallengeShareText(data: QuizChallenge): string {
  const stars = '⭐'.repeat(data.stars);
  return [
    `🎮 Desafio do MestreMiúdo!`,
    `${data.from} fez ${data.score}/${data.total} no quiz de ${data.subject} (${stars}).`,
    `Consegues bater a marca? Vem jogar!`,
  ].join(' ');
}

// Constrói a ligação para o amigo aceitar o desafio.
export function buildChallengeLink(data: QuizChallenge, origin: string): string {
  const slug = subjectToSlug(data.subject);
  const encoded = encodeChallenge(data);
  return `${origin}/quiz/${slug}?challenge=${encoded}&grade=${data.grade}`;
}

export type ChallengeComparison = {
  beat: boolean;
  message: string;
};

// Compara o resultado do amigo com o desafio original.
export function compareChallenge(data: QuizChallenge, myScore: number): ChallengeComparison {
  const beat = myScore > data.score;
  const tied = myScore === data.score;
  let message: string;
  if (beat) {
    message = `🏆 Bateste o desafio de ${data.from}! Fizeste ${myScore} e ele/a fez ${data.score}.`;
  } else if (tied) {
    message = `🤝 Empataste com ${data.from}! Ambos fizestes ${myScore}.`;
  } else {
    message = `💪 ${data.from} ganhou desta vez (${data.score} vs ${myScore}). Tenta outra vez!`;
  }
  return { beat, message };
}

// Constrói uma ligação do WhatsApp com o texto + ligação do desafio pré-preenchidos.
// Usa o formato wa.me (sem número) para abrir o seletor de conversa no telemóvel/desktop.
export function buildWhatsappLink(data: QuizChallenge, origin: string): string {
  const text = `${buildChallengeShareText(data)} ${buildChallengeLink(data, origin)}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// Constrói uma ligação de e-mail (mailto) com assunto e corpo pré-preenchidos
// com o desafio e a ligação para o amigo aceitar.
export function buildEmailLink(data: QuizChallenge, origin: string): string {
  const link = buildChallengeLink(data, origin);
  const subject = encodeURIComponent('Desafio do MestreMiúdo 🎮');
  const body = encodeURIComponent(`${buildChallengeShareText(data)} ${link}`);
  return `mailto:?subject=${subject}&body=${body}`;
}

export type ChallengeShareResult = 'shared' | 'copied' | 'failed';

// Partilha o desafio via Web Share API, com fallback para copiar para a área de transferência.
export async function shareChallenge(
  data: QuizChallenge,
  origin: string
): Promise<ChallengeShareResult> {
  const text = buildChallengeShareText(data);
  const url = buildChallengeLink(data, origin);

  if (typeof navigator !== 'undefined') {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'MestreMiúdo - Desafio', text, url });
        return 'shared';
      } catch {
        // O utilizador fechou o diálogo; cair para o fallback de cópia.
      }
    }
    if (typeof navigator.clipboard?.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        return 'copied';
      } catch {
        return 'failed';
      }
    }
  }
  return 'failed';
}
