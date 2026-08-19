import { describe, it, expect, vi, afterEach } from 'vitest';

/**
 * pixabay.ts captures `process.env.PIXABAY_API_KEY` at module-load time, so we
 * use `vi.resetModules()` + dynamic `import` per test to control it.
 */
async function loadPixabay(apiKey: string) {
  vi.resetModules();
  vi.stubEnv('PIXABAY_API_KEY', apiKey);
  const mod = await import('@/lib/pixabay');
  return mod;
}

function mockFetchResponse(hits: Array<{ webformatURL: string }> = [{ webformatURL: 'https://pixabay.com/id-1.jpg' }]) {
  return {
    ok: true,
    json: async () => ({ total: hits.length, totalHits: hits.length, hits }),
  };
}

describe('pixabay (fetch helpers)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns null when API key is not configured', async () => {
    const { fetchPixabayImage } = await loadPixabay('');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const result = await fetchPixabayImage('numbers');
    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns null when the API responds with an error status', async () => {
    const { fetchPixabayImage } = await loadPixabay('test-key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const result = await fetchPixabayImage('numbers');
    expect(result).toBeNull();
  });

  it('returns null when there are no hits', async () => {
    const { fetchPixabayImage } = await loadPixabay('test-key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse([])));
    const result = await fetchPixabayImage('numbers');
    expect(result).toBeNull();
  });

  it('returns the first hit webformatURL on success', async () => {
    const { fetchPixabayImage } = await loadPixabay('test-key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse([
      { webformatURL: 'https://pixabay.com/id-1.jpg' },
      { webformatURL: 'https://pixabay.com/id-2.jpg' },
      { webformatURL: 'https://pixabay.com/id-3.jpg' },
    ])));
    const result = await fetchPixabayImage('numbers');
    expect(result).toBe('https://pixabay.com/id-1.jpg');
  });

  it('returns null when the request throws', async () => {
    const { fetchPixabayImage } = await loadPixabay('test-key');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const result = await fetchPixabayImage('numbers');
    expect(result).toBeNull();
  });

  it('passes safeSearch=true and required query params for a known topic', async () => {
    const { fetchImageForTopic } = await loadPixabay('test-key');
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse());
    vi.stubGlobal('fetch', fetchMock);

    await fetchImageForTopic('Alfabeto');

    const url = fetchMock.mock.calls[0][0] as string;
    const params = new URL(url).searchParams;
    expect(params.get('q')).toBe('alphabet letters');
    expect(params.get('safesearch')).toBe('true');
    expect(params.get('image_type')).toBe('photo');
    expect(params.get('min_width')).toBe('400');
    expect(params.get('per_page')).toBe('3');
  });

  it('falls back to the default keyword for an unknown topic', async () => {
    const { fetchImageForTopic } = await loadPixabay('test-key');
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse());
    vi.stubGlobal('fetch', fetchMock);

    await fetchImageForTopic('TemaDesconhecido');

    const params = new URL(fetchMock.mock.calls[0][0] as string).searchParams;
    expect(params.get('q')).toBe('education children learning');
  });

  it('falls back to the default keyword for an undefined topic', async () => {
    const { fetchImageForTopic } = await loadPixabay('test-key');
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse());
    vi.stubGlobal('fetch', fetchMock);

    await fetchImageForTopic(undefined);

    const params = new URL(fetchMock.mock.calls[0][0] as string).searchParams;
    expect(params.get('q')).toBe('education children learning');
  });

  describe('fetchImageForTopic / fetchImagesForTopics', () => {
    it('fetchImageForTopic resolves the topic via getSearchKeywords', async () => {
      const { fetchImageForTopic } = await loadPixabay('test-key');
      const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse([{ webformatURL: 'img.png' }]));
      vi.stubGlobal('fetch', fetchMock);

      const result = await fetchImageForTopic('Vogais');
      expect(result).toBe('img.png');
      const params = new URL(fetchMock.mock.calls[0][0] as string).searchParams;
      expect(params.get('q')).toBe('vowels alphabet');
    });

    it('fetchImageForTopic returns null when configured with no key', async () => {
      const { fetchImageForTopic } = await loadPixabay('');
      vi.stubGlobal('fetch', vi.fn());
      expect(await fetchImageForTopic('Vogais')).toBeNull();
    });

    it('fetchImagesForTopics returns one URL per topic in parallel', async () => {
      const { fetchImagesForTopics } = await loadPixabay('test-key');
      const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse([{ webformatURL: 'img.png' }]));
      vi.stubGlobal('fetch', fetchMock);

      const results = await fetchImagesForTopics(['Vogais', 'Animais', undefined]);
      expect(results).toHaveLength(3);
      expect(results.every((r) => r === 'img.png')).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });
});
