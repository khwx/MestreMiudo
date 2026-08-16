import { describe, it, expect, vi, beforeEach } from 'vitest';

// Shared, mutable mock state controlled per-test
const eqMock = vi.fn();
const deleteMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ delete: deleteMock }));
const isSupabaseConfiguredMock = vi.fn(() => true);

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: fromMock,
  },
  isSupabaseConfigured: isSupabaseConfiguredMock,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('deleteStory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSupabaseConfiguredMock.mockReturnValue(true);
  });

  it('retorna sucesso quando a eliminação não produz erro', async () => {
    eqMock.mockReturnValue({ error: null });

    const { deleteStory } = await import('@/app/actions/stories');
    const result = await deleteStory('story-123');

    expect(result).toEqual({ success: true });
    expect(fromMock).toHaveBeenCalledWith('stories');
    expect(eqMock).toHaveBeenCalledWith('id', 'story-123');
  });

  it('registra erro e retorna mensagem quando a DB falha', async () => {
    const dbError = new Error('Falha na ligação');
    eqMock.mockReturnValue({ error: dbError });

    const { logger } = await import('@/lib/logger');
    const { deleteStory } = await import('@/app/actions/stories');
    const result = await deleteStory('story-123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Falha ao eliminar história');
    expect(logger.error).toHaveBeenCalled();
  });

  it('devolve erro quando supabase não está configurado', async () => {
    isSupabaseConfiguredMock.mockReturnValue(false);

    const { deleteStory } = await import('@/app/actions/stories');
    const result = await deleteStory('story-123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Supabase não configurado');
    expect(fromMock).not.toHaveBeenCalled();
  });
});
