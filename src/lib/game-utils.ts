export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const GRID_NAVIGATION_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
] as const;

/**
 * Compute the next cell index when navigating a grid with the arrow keys.
 * Supports clamping at edges and a partially-filled final row. Returns `null`
 * for keys that are not navigation keys so callers can let the default happen.
 */
export function getGridNavigationIndex(
  current: number,
  key: string,
  columns: number,
  total: number
): number | null {
  if (total <= 0 || columns <= 0) return null;

  const rows = Math.ceil(total / columns);
  let row = Math.floor(current / columns);
  let col = current % columns;

  switch (key) {
    case 'ArrowLeft':
      if (col > 0) col -= 1;
      break;
    case 'ArrowRight':
      if (col < columns - 1) col += 1;
      break;
    case 'ArrowUp':
      if (row > 0) row -= 1;
      break;
    case 'ArrowDown':
      if (row < rows - 1) row += 1;
      break;
    case 'Home':
      col = 0;
      break;
    case 'End':
      col = row === rows - 1 ? (total - 1) % columns : columns - 1;
      break;
    default:
      return null;
  }

  let target = row * columns + col;
  if (target >= total) target = total - 1;
  return target;
}
