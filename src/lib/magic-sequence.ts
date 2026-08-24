export type Grade = 1 | 2 | 3 | 4;

export interface SequencePuzzle {
  /** Sequence of terms; `null` marks the position the child must fill in. */
  terms: (number | null)[];
  /** The correct value for the blank position. */
  correct: number;
  /** Four answer options (including the correct one), shuffled. */
  options: number[];
  /** Short human-readable description of the rule. */
  pattern: string;
  /** Child-friendly explanation of how to find the answer. */
  explanation: string;
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface Rule {
  terms: number[];
  pattern: string;
  explanation: (correct: number) => string;
}

function buildArithmetic(grade: Grade): Rule {
  let start: number;
  let step: number;

  if (grade <= 1) {
    step = [1, 2, 5][randInt(0, 2)];
    start = randInt(1, Math.max(2, 20 - step * 4));
  } else if (grade === 2) {
    step = [2, 5, 10][randInt(0, 2)];
    start = randInt(1, 90);
  } else if (grade === 3) {
    step = [3, 5, 10, 25][randInt(0, 3)];
    start = randInt(1, 80);
  } else {
    step = [4, 7, 12, 20, 50][randInt(0, 4)];
    start = randInt(1, 100);
  }

  const length = 5;
  const terms = Array.from({ length }, (_, i) => start + i * step);

  return {
    terms,
    pattern: `Cada número é o anterior ${step >= 0 ? 'aumentado' : 'diminuído'} de ${Math.abs(step)}`,
    explanation: (correct: number) =>
      `A sequência cresce de ${Math.abs(step)} em ${Math.abs(step)}. O número que falta é ${correct}.`,
  };
}

function buildGeometric(grade: Grade): Rule {
  const ratio = grade >= 4 ? [2, 3, 4][randInt(0, 2)] : [2, 3][randInt(0, 1)];
  const start = randInt(1, grade >= 4 ? 5 : 3);
  const length = 4;
  const terms = Array.from({ length }, (_, i) => start * Math.pow(ratio, i));

  return {
    terms,
    pattern: `Cada número é o anterior multiplicado por ${ratio}`,
    explanation: (correct: number) =>
      `Cada número é o anterior vezes ${ratio}. O número que falta é ${correct}.`,
  };
}

function buildFibonacciLike(grade: Grade): Rule {
  const a = randInt(1, grade >= 4 ? 8 : 5);
  const b = a + randInt(1, grade >= 4 ? 8 : 5);
  const terms: number[] = [a, b];
  for (let i = 2; i < 5; i++) {
    terms.push(terms[i - 1] + terms[i - 2]);
  }

  return {
    terms,
    pattern: 'Cada número é a soma dos dois anteriores',
    explanation: (correct: number) =>
      `Cada número é a soma dos dois que vêm antes. O número que falta é ${correct}.`,
  };
}

export function generateSequencePuzzle(grade: Grade): SequencePuzzle {
  let rule: Rule;

  const roll = Math.random();
  if (grade <= 1) {
    rule = buildArithmetic(grade);
  } else if (grade === 2) {
    rule = roll < 0.85 ? buildArithmetic(grade) : buildFibonacciLike(grade);
  } else if (grade === 3) {
    rule = roll < 0.6 ? buildArithmetic(grade) : roll < 0.85 ? buildGeometric(grade) : buildFibonacciLike(grade);
  } else {
    rule = roll < 0.5 ? buildArithmetic(grade) : roll < 0.8 ? buildGeometric(grade) : buildFibonacciLike(grade);
  }

  const terms: (number | null)[] = [...rule.terms];
  // Blank out a middle-ish position (never the very first) so the rule is visible.
  const blankIndex = randInt(1, terms.length - 1);
  const correct = terms[blankIndex]!;
  terms[blankIndex] = null;

  const options = buildOptions(correct, terms);

  return {
    terms,
    correct,
    options,
    pattern: rule.pattern,
    explanation: rule.explanation(correct),
  };
}

function buildOptions(correct: number, terms: (number | null)[]): number[] {
  const used = new Set<number>();
  terms.forEach((t) => {
    if (t !== null) used.add(t);
  });

  const candidates = new Set<number>([correct]);

  // Derive plausible distractors from the rule itself.
  const existing = terms.filter((t): t is number => t !== null);
  const baseStep = existing.length >= 2 ? existing[1] - existing[0] : 1;

  const attempts = [
    correct + baseStep,
    correct - baseStep,
    correct + baseStep * 2,
    correct - baseStep * 2,
    correct + 1,
    correct - 1,
    correct * 2,
    Math.round(correct / 2),
  ];

  for (const attempt of attempts) {
    if (candidates.size >= 4) break;
    if (attempt >= 0 && !used.has(attempt) && attempt !== correct) {
      candidates.add(attempt);
    }
  }

  // Fallback random fill if needed.
  let guard = 0;
  while (candidates.size < 4 && guard < 100) {
    guard++;
    const offset = randInt(-10, 10);
    const candidate = correct + offset;
    if (candidate >= 0 && !used.has(candidate) && candidate !== correct) {
      candidates.add(candidate);
    }
  }

  return shuffle(Array.from(candidates));
}

export function checkSequenceAnswer(puzzle: SequencePuzzle, answer: number): boolean {
  return answer === puzzle.correct;
}
