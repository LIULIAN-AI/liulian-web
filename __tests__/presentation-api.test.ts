import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getAgentSettings, switchAgentProvider } from '@/lib/presentation-api';

const AGENT_BASE_URL = (
  process.env.NEXT_PUBLIC_AGENT_BASE_URL ||
  'http://localhost:8000'
).replace(/\/+$/, '');

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('presentation-api', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects missing passkey for settings fetch', async () => {
    await expect(getAgentSettings('   ')).rejects.toThrow('Missing presentation passkey.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetches settings with expected contract', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        provider: 'openai',
        available_providers: ['openai', 'anthropic'],
        demo_mode_hint: 'Use demo mode for stage environments.',
      }),
    );

    await expect(getAgentSettings(' demo key ')).resolves.toEqual({
      provider: 'openai',
      available_providers: ['openai', 'anthropic'],
      demo_mode_hint: 'Use demo mode for stage environments.',
    });

    expect(fetchMock).toHaveBeenCalledWith(`${AGENT_BASE_URL}/agent/settings?key=demo%20key`, {
      cache: 'no-store',
    });
  });

  it('surfaces settings fetch HTTP errors with response details', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('backend unavailable', {
        status: 503,
        statusText: 'Service Unavailable',
      }),
    );

    await expect(getAgentSettings('demo')).rejects.toThrow(
      'Settings fetch failed: 503 Service Unavailable backend unavailable',
    );
  });

  it('rejects non-JSON settings responses', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('not-json', {
        status: 200,
        statusText: 'OK',
      }),
    );

    await expect(getAgentSettings('demo')).rejects.toThrow('Agent API returned non-JSON data.');
  });

  it('rejects invalid settings payload shape', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        provider: 'openai',
        available_providers: 'openai',
        demo_mode_hint: 'hint',
      }),
    );

    await expect(getAgentSettings('demo')).rejects.toThrow(
      'Invalid settings response: available_providers must be string[].',
    );
  });

  it('validates passkey and provider before provider switch', async () => {
    await expect(switchAgentProvider('   ', 'openai')).rejects.toThrow('Missing presentation passkey.');
    await expect(switchAgentProvider('demo', '   ')).rejects.toThrow('Provider name is required.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts provider switch request with expected contract', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        status: 'ok',
        active_provider: 'anthropic',
      }),
    );

    await expect(switchAgentProvider(' demo key ', ' anthropic ')).resolves.toEqual({
      status: 'ok',
      active_provider: 'anthropic',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${AGENT_BASE_URL}/agent/settings/provider?key=demo%20key`,
      {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: 'anthropic' }),
      },
    );
  });

  it('surfaces provider switch errors and invalid payloads', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response('not allowed', {
          status: 400,
          statusText: 'Bad Request',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          status: 1,
          active_provider: 'anthropic',
        }),
      );

    await expect(switchAgentProvider('demo', 'anthropic')).rejects.toThrow(
      'Provider switch failed: 400 Bad Request not allowed',
    );
    await expect(switchAgentProvider('demo', 'anthropic')).rejects.toThrow(
      'Invalid provider switch response: status and active_provider must be strings.',
    );
  });
});
