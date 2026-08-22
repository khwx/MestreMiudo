export interface QuizSeriesRow {
  subject: string | null;
  score: number;
  totalQuestions: number;
  createdAt: string;
}

export interface SubjectSeriesPoint {
  date: string;
  [subject: string]: number | null | string;
}

const SUBJECT_ALIASES: Record<string, string> = {
  portugues: 'Português',
  'estudo do meio': 'Estudo do Meio',
  matematica: 'Matemática',
  matemática: 'Matemática',
};

export function normalizeSubjectName(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return 'Geral';
  const key = raw.trim().toLowerCase();
  return SUBJECT_ALIASES[key] ?? raw.trim();
}

export interface DateKey {
  label: string;
  iso: string;
}

export function getDateKeys(days: number, now: Date = new Date()): DateKey[] {
  const out: DateKey[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push({
      label: d.toLocaleDateString('pt-PT'),
      iso: d.toISOString().split('T')[0],
    });
  }
  return out;
}

export interface BuildSeriesOptions {
  days?: number;
  subjects?: string[];
  now?: Date;
}

export function buildSubjectTimeSeries(
  rows: QuizSeriesRow[],
  options: BuildSeriesOptions = {}
): SubjectSeriesPoint[] {
  const days = options.days ?? 7;
  const now = options.now ?? new Date();
  const dateKeys = getDateKeys(days, now);
  const windowIsos = new Set(dateKeys.map((dk) => dk.iso));

  const subjectSet = new Set<string>(options.subjects ?? []);
  rows.forEach((r) => {
    const iso = (r.createdAt || '').slice(0, 10);
    if (windowIsos.has(iso)) subjectSet.add(normalizeSubjectName(r.subject));
  });

  const buckets = new Map<string, Map<string, { correct: number; total: number }>>();
  dateKeys.forEach((dk) => buckets.set(dk.iso, new Map()));

  rows.forEach((r) => {
    const iso = (r.createdAt || '').slice(0, 10);
    const bucket = buckets.get(iso);
    if (!bucket) return;
    const subj = normalizeSubjectName(r.subject);
    const entry = bucket.get(subj) ?? { correct: 0, total: 0 };
    entry.correct += r.score;
    entry.total += r.totalQuestions;
    bucket.set(subj, entry);
  });

  return dateKeys.map((dk) => {
    const bucket = buckets.get(dk.iso)!;
    const point: SubjectSeriesPoint = { date: dk.label };
    subjectSet.forEach((subj) => {
      const entry = bucket.get(subj);
      point[subj] = entry && entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : null;
    });
    return point;
  });
}

export function getSeriesSubjects(points: SubjectSeriesPoint[]): string[] {
  if (!points.length) return [];
  return Object.keys(points[0]).filter((k) => k !== 'date');
}
