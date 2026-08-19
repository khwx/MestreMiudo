import { describe, it, expect, vi } from 'vitest';
import {
  OFFLINE_SUBJECTS,
  OFFLINE_GRADES,
  buildSupabaseLessonUrl,
  buildLessonPreloadUrls,
  isServiceWorkerReady,
  triggerLessonPreload,
  preloadAllLessons,
} from '@/lib/offline-preload';

const TEST_SUPABASE_URL = 'https://abc123.supabase.co';

describe('buildSupabaseLessonUrl', () => {
  it('builds a REST URL with query params for subject and grade', () => {
    const url = buildSupabaseLessonUrl(TEST_SUPABASE_URL, 'Português', 1);
    expect(url).toBe(
      'https://abc123.supabase.co/rest/v1/lessons?subject=eq.Portugu%C3%AAs&grade_level=eq.1&order=lesson_index.asc',
    );
  });

  it('handles trailing slashes on the supabase URL', () => {
    const url = buildSupabaseLessonUrl('https://example.supabase.co/', 'Matemática', 2);
    expect(url).toContain('/rest/v1/lessons');
    expect(url).not.toContain('//rest');
  });

  it('returns null when supabaseUrl is undefined', () => {
    expect(buildSupabaseLessonUrl(undefined, 'Matemática', 2)).toBeNull();
  });

  it('returns null when supabaseUrl is empty string', () => {
    expect(buildSupabaseLessonUrl('', 'Matemática', 2)).toBeNull();
  });

  it('encodes the Estudo do Meio subject correctly', () => {
    const url = buildSupabaseLessonUrl(TEST_SUPABASE_URL, 'Estudo do Meio', 3);
    expect(url).toContain('subject=eq.Estudo+do+Meio');
    expect(url).toContain('grade_level=eq.3');
  });
});

describe('buildLessonPreloadUrls', () => {
  it('returns 12 URLs for all 3 subjects × 4 grades', () => {
    const urls = buildLessonPreloadUrls(TEST_SUPABASE_URL);
    expect(urls).toHaveLength(12);
  });

  it('all URLs point to the lessons REST endpoint', () => {
    const urls = buildLessonPreloadUrls(TEST_SUPABASE_URL);
    urls.forEach((url) => {
      expect(url).toContain('/rest/v1/lessons');
    });
  });

  it('returns empty array when supabaseUrl is undefined', () => {
    expect(buildLessonPreloadUrls(undefined)).toEqual([]);
  });

  it('respects custom subjects and grades', () => {
    const urls = buildLessonPreloadUrls(TEST_SUPABASE_URL, ['Português'], [1]);
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain('subject=eq.Portugu%C3%AAs');
    expect(urls[0]).toContain('grade_level=eq.1');
  });

  it('produces unique URLs', () => {
    const urls = buildLessonPreloadUrls(TEST_SUPABASE_URL);
    const unique = new Set(urls);
    expect(unique.size).toBe(urls.length);
  });

  it('covers every grade from OFFLINE_GRADES', () => {
    const urls = buildLessonPreloadUrls(TEST_SUPABASE_URL);
    OFFLINE_GRADES.forEach((grade) => {
      const matching = urls.filter((u) => u.includes(`grade_level=eq.${grade}`));
      expect(matching).toHaveLength(3);
    });
  });
});

describe('isServiceWorkerReady', () => {
  it('returns false when navigator is undefined', () => {
    const originalNavigator = global.navigator;
    // @ts-expect-error intentionally remove navigator
    delete global.navigator;
    expect(isServiceWorkerReady()).toBe(false);
    global.navigator = originalNavigator;
  });

  it('returns false when serviceWorker is not present', () => {
    const original = global.navigator;
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true,
      configurable: true,
    });
    expect(isServiceWorkerReady()).toBe(false);
    Object.defineProperty(global, 'navigator', {
      value: original,
      writable: true,
      configurable: true,
    });
  });

  it('returns false when controller is null', () => {
    const original = global.navigator;
    Object.defineProperty(global, 'navigator', {
      value: { serviceWorker: { controller: null } },
      writable: true,
      configurable: true,
    });
    expect(isServiceWorkerReady()).toBe(false);
    Object.defineProperty(global, 'navigator', {
      value: original,
      writable: true,
      configurable: true,
    });
  });
});

describe('triggerLessonPreload', () => {
  it('returns false when navigator is undefined', () => {
    const originalNavigator = global.navigator;
    // @ts-expect-error intentionally remove navigator
    delete global.navigator;
    expect(triggerLessonPreload(['https://example.com'])).toBe(false);
    global.navigator = originalNavigator;
  });

  it('returns false when serviceWorker controller is not available', () => {
    const original = global.navigator;
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true,
      configurable: true,
    });
    expect(triggerLessonPreload(['https://example.com'])).toBe(false);
    Object.defineProperty(global, 'navigator', {
      value: original,
      writable: true,
      configurable: true,
    });
  });

  it('returns true and posts message when SW is ready', () => {
    const original = global.navigator;
    const postMessage = vi.fn();
    const controller = { postMessage };
    Object.defineProperty(global, 'navigator', {
      value: { serviceWorker: { controller } },
      writable: true,
      configurable: true,
    });
    const result = triggerLessonPreload(['https://example.com/lessons']);
    expect(result).toBe(true);
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({
      type: 'PRELOAD_LESSONS',
      urls: ['https://example.com/lessons'],
    });
    Object.defineProperty(global, 'navigator', {
      value: original,
      writable: true,
      configurable: true,
    });
  });

  it('does nothing with empty urls array but still returns true', () => {
    const original = global.navigator;
    const postMessage = vi.fn();
    Object.defineProperty(global, 'navigator', {
      value: { serviceWorker: { controller: { postMessage } } },
      writable: true,
      configurable: true,
    });
    expect(triggerLessonPreload([])).toBe(true);
    expect(postMessage).toHaveBeenCalled();
    Object.defineProperty(global, 'navigator', {
      value: original,
      writable: true,
      configurable: true,
    });
  });
});

describe('preloadAllLessons', () => {
  it('returns URLs and triggers preload when supabase URL is present', () => {
    const original = global.navigator;
    const postMessage = vi.fn();
    Object.defineProperty(global, 'navigator', {
      value: { serviceWorker: { controller: { postMessage } } },
      writable: true,
      configurable: true,
    });
    const urls = preloadAllLessons(TEST_SUPABASE_URL);
    expect(urls).toHaveLength(12);
    expect(postMessage).toHaveBeenCalled();
    Object.defineProperty(global, 'navigator', {
      value: original,
      writable: true,
      configurable: true,
    });
  });

  it('returns empty array and does not post when supabase URL is undefined', () => {
    const original = global.navigator;
    const postMessage = vi.fn();
    Object.defineProperty(global, 'navigator', {
      value: { serviceWorker: { controller: { postMessage } } },
      writable: true,
      configurable: true,
    });
    const urls = preloadAllLessons(undefined);
    expect(urls).toEqual([]);
    expect(postMessage).not.toHaveBeenCalled();
    Object.defineProperty(global, 'navigator', {
      value: original,
      writable: true,
      configurable: true,
    });
  });

  it('does not throw when window is undefined (SSR safe)', () => {
    const originalWindow = global.window;
    const originalNavigator = global.navigator;
    // @ts-expect-error simulate SSR
    delete global.window;
    // @ts-expect-error simulate SSR
    delete global.navigator;
    expect(() => preloadAllLessons(TEST_SUPABASE_URL)).not.toThrow();
    expect(preloadAllLessons(TEST_SUPABASE_URL)).toEqual([]);
    global.window = originalWindow;
    global.navigator = originalNavigator;
  });
});

describe('OFFLINE_SUBJECTS and OFFLINE_GRADES constants', () => {
  it('exposes the three curriculum subjects', () => {
    expect(OFFLINE_SUBJECTS).toEqual(['Português', 'Matemática', 'Estudo do Meio']);
  });

  it('covers grades 1 through 4', () => {
    expect(OFFLINE_GRADES).toEqual([1, 2, 3, 4]);
  });
});
