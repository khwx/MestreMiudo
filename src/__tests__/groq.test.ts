import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Hoisted mock: exposes `__create` so each test can control the chat completion result.
const groqSdkMock = vi.hoisted(() => {
  const create = vi.fn();
  function MockGroq() {
    return { chat: { completions: { create } } };
  }
  return { default: MockGroq, __create: create };
});

vi.mock('groq-sdk', () => groqSdkMock);

describe('generateWithGroq', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('GROQ_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    groqSdkMock.__create.mockReset();
  });

  it('throws when GROQ_API_KEY is not configured', async () => {
    vi.stubEnv('GROQ_API_KEY', '');
    const { generateWithGroq } = await import('@/lib/groq');
    await expect(generateWithGroq('hello')).rejects.toThrow('GROQ_API_KEY not configured');
  });

  it('returns the assistant content on a successful request', async () => {
    groqSdkMock.__create.mockResolvedValue({
      choices: [{ message: { content: 'resposta de teste' } }],
    });
    const { generateWithGroq } = await import('@/lib/groq');
    const result = await generateWithGroq('Qual é a capital de Portugal?');
    expect(result).toBe('resposta de teste');
    expect(groqSdkMock.__create).toHaveBeenCalledTimes(1);
    const payload = groqSdkMock.__create.mock.calls[0][0];
    expect(payload.model).toBe('llama-3.3-70b-versatile');
    expect(payload.messages).toHaveLength(1);
    expect(payload.messages[0]).toEqual({ role: 'user', content: 'Qual é a capital de Portugal?' });
  });

  it('includes the system prompt when provided', async () => {
    groqSdkMock.__create.mockResolvedValue({
      choices: [{ message: { content: 'ok' } }],
    });
    const { generateWithGroq } = await import('@/lib/groq');
    await generateWithGroq('pergunta', 'system prompt aqui');
    const payload = groqSdkMock.__create.mock.calls[0][0];
    expect(payload.messages).toHaveLength(2);
    expect(payload.messages[0]).toEqual({ role: 'system', content: 'system prompt aqui' });
    expect(payload.messages[1]).toEqual({ role: 'user', content: 'pergunta' });
  });

  it('returns empty string when the response has no content', async () => {
    groqSdkMock.__create.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });
    const { generateWithGroq } = await import('@/lib/groq');
    expect(await generateWithGroq('x')).toBe('');
  });

  it('uses temperature and max_tokens defaults', async () => {
    groqSdkMock.__create.mockResolvedValue({
      choices: [{ message: { content: 'ok' } }],
    });
    const { generateWithGroq } = await import('@/lib/groq');
    await generateWithGroq('ping');
    const payload = groqSdkMock.__create.mock.calls[0][0];
    expect(payload.temperature).toBe(0.7);
    expect(payload.max_tokens).toBe(2048);
  });
});
