import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isSupabaseConfigured } from '@/lib/supabase';

describe('isSupabaseConfigured', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl || '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey || '';
  });

  it('returns false when URL is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'some-key';
    const result = await import('@/lib/supabase').then(m => m.isSupabaseConfigured());
    expect(result).toBe(false);
  });

  it('returns false when key is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    const result = await import('@/lib/supabase').then(m => m.isSupabaseConfigured());
    expect(result).toBe(false);
  });

  it('returns false for invalid URL', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'some-key';
    const result = await import('@/lib/supabase').then(m => m.isSupabaseConfigured());
    expect(result).toBe(false);
  });

  it('returns false for non-http URL', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'ftp://example.com';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'some-key';
    const result = await import('@/lib/supabase').then(m => m.isSupabaseConfigured());
    expect(result).toBe(false);
  });
});
