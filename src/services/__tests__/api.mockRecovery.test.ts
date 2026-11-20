import { describe, it, expect, beforeEach, vi } from 'vitest';

// The in-browser mock API is on, as in the demo.
vi.mock('@/constants/api', async (importOriginal) => {
  const { API_CONFIG } =
    await importOriginal<typeof import('@/constants/api')>();
  return { API_CONFIG: { ...API_CONFIG, USE_MOCK_API: true } };
});

const reactivateMockApi = vi.fn();
vi.mock('@/mocks/browser', () => ({ reactivateMockApi }));

const { api } = await import('../api');

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
  });
const html = () =>
  new Response('<!doctype html>', { headers: { 'content-type': 'text/html' } });

describe('api with the mock service worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it('uses a mock answer as it is', async () => {
    vi.mocked(fetch).mockResolvedValue(json([{ _id: '1' }]));

    expect(await api.get('/messages')).toEqual([{ _id: '1' }]);
    expect(reactivateMockApi).not.toHaveBeenCalled();
  });

  it('turns mocking back on and retries when the worker was restarted', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(html())
      .mockResolvedValueOnce(json([{ _id: '1' }]));
    reactivateMockApi.mockResolvedValue(true);

    expect(await api.get('/messages')).toEqual([{ _id: '1' }]);
    expect(reactivateMockApi).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('fails instead of retrying when mocking cannot be turned back on', async () => {
    vi.mocked(fetch).mockResolvedValue(html());
    reactivateMockApi.mockResolvedValue(false);

    await expect(api.get('/messages')).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
