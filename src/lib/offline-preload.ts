/**
 * @fileOverview Helpers for proactively preloading lesson data into the
 * service worker cache so children can browse lessons even while offline.
 *
 * The functions in this file are intentionally pure / side-effect free so they
 * can be unit-tested without a browser environment.
 */

export const OFFLINE_SUBJECTS: ReadonlyArray<'Português' | 'Matemática' | 'Estudo do Meio'> = [
  'Português',
  'Matemática',
  'Estudo do Meio',
];

export const OFFLINE_GRADES: ReadonlyArray<number> = [1, 2, 3, 4];

export type PreloadMessage = {
  type: 'PRELOAD_LESSONS';
  urls: string[];
};

/**
 * Build the Supabase REST API URL that lists lessons for a given
 * subject and grade. The URL is constructed so that the service worker's
 * existing `networkFirstWithCache` strategy will cache it.
 *
 * @param supabaseUrl  The Supabase project URL (NEXT_PUBLIC_SUPABASE_URL).
 * @param subject      One of the supported subjects.
 * @param gradeLevel   Numeric grade (1-4).
 * @returns A fully-formed REST URL or `null` when the supabase URL is absent.
 */
export function buildSupabaseLessonUrl(
  supabaseUrl: string | undefined,
  subject: string,
  gradeLevel: number,
): string | null {
  if (!supabaseUrl) return null;

  const base = supabaseUrl.replace(/\/+$/, '');
  const params = new URLSearchParams({
    subject: `eq.${subject}`,
    grade_level: `eq.${gradeLevel}`,
    order: 'lesson_index.asc',
  });

  return `${base}/rest/v1/lessons?${params.toString()}`;
}

/**
 * Generate every lesson-list URL that should be preloaded so all four
 * grades and three subjects are available offline.
 *
 * @param supabaseUrl  The Supabase project URL.
 * @param subjects     Subjects to preload (defaults to all three).
 * @param grades       Grades to preload (defaults to 1-4).
 * @returns Array of fully-formed REST URLs (may be empty if no URL configured).
 */
export function buildLessonPreloadUrls(
  supabaseUrl: string | undefined,
  subjects: ReadonlyArray<string> = OFFLINE_SUBJECTS,
  grades: ReadonlyArray<number> = OFFLINE_GRADES,
): string[] {
  const urls: string[] = [];

  for (const grade of grades) {
    for (const subject of subjects) {
      const url = buildSupabaseLessonUrl(supabaseUrl, subject, grade);
      if (url) urls.push(url);
    }
  }

  return urls;
}

/**
 * Check whether the service worker is currently ready (controlling the page).
 */
export function isServiceWorkerReady(): boolean {
  if (typeof navigator === 'undefined') return false;
  return !!navigator.serviceWorker?.controller;
}

/**
 * Ask the active service worker to proactively fetch and cache the given
 * lesson URLs. Safe to call on the client only.
 *
 * @param urls  URLs produced by `buildLessonPreloadUrls`.
 * @returns `true` when the message was sent, `false` when no SW is available
 *          or the function is called outside the browser.
 */
export function triggerLessonPreload(urls: string[]): boolean {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker?.controller) {
    return false;
  }

  navigator.serviceWorker.controller?.postMessage({
    type: 'PRELOAD_LESSONS',
    urls,
  });

  return true;
}

/**
 * Convenience: build URLs from the Supabase env var and immediately ask the
 * service worker to preload them.
 *
 * @param supabaseUrl  Usually `process.env.NEXT_PUBLIC_SUPABASE_URL`.
 * @returns The list of URLs that were sent for preloading (empty if none).
 */
export function preloadAllLessons(supabaseUrl: string | undefined): string[] {
  if (typeof window === 'undefined') return [];

  const urls = buildLessonPreloadUrls(supabaseUrl);
  if (urls.length > 0) {
    triggerLessonPreload(urls);
  }
  return urls;
}
