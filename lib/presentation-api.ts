const AGENT_BASE_URL = (
  process.env.NEXT_PUBLIC_AGENT_BASE_URL ||
  'http://localhost:8000'
).replace(/\/+$/, '');

export interface AgentSettings {
  provider: string | null;
  available_providers: string[];
  demo_mode_hint: string;
}

export interface ProviderSwitchResponse {
  status: string;
  active_provider: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function ensurePasskey(passkey: string): string {
  const trimmed = passkey.trim();
  if (!trimmed) {
    throw new Error('Missing presentation passkey.');
  }
  return trimmed;
}

function ensureProvider(provider: string): string {
  const trimmed = provider.trim();
  if (!trimmed) {
    throw new Error('Provider name is required.');
  }
  return trimmed;
}

function buildAgentUrl(path: string, passkey: string): string {
  return `${AGENT_BASE_URL}${path}?key=${encodeURIComponent(passkey)}`;
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Agent API returned non-JSON data.');
  }
}

async function buildErrorMessage(prefix: string, response: Response): Promise<string> {
  const details = await response.text();
  if (details) {
    return `${prefix}: ${response.status} ${response.statusText} ${details}`.trim();
  }
  return `${prefix}: ${response.status} ${response.statusText}`.trim();
}

function parseSettingsPayload(payload: unknown): AgentSettings {
  if (!isRecord(payload)) {
    throw new Error('Invalid settings response: expected object payload.');
  }

  const provider = payload.provider;
  if (provider !== null && typeof provider !== 'string') {
    throw new Error('Invalid settings response: provider must be string or null.');
  }

  const availableProviders = payload.available_providers;
  if (
    !Array.isArray(availableProviders) ||
    availableProviders.some((item) => typeof item !== 'string')
  ) {
    throw new Error('Invalid settings response: available_providers must be string[].');
  }

  if (typeof payload.demo_mode_hint !== 'string') {
    throw new Error('Invalid settings response: demo_mode_hint must be string.');
  }

  return {
    provider,
    available_providers: availableProviders,
    demo_mode_hint: payload.demo_mode_hint,
  };
}

function parseSwitchPayload(payload: unknown): ProviderSwitchResponse {
  if (!isRecord(payload)) {
    throw new Error('Invalid provider switch response: expected object payload.');
  }

  if (typeof payload.status !== 'string' || typeof payload.active_provider !== 'string') {
    throw new Error(
      'Invalid provider switch response: status and active_provider must be strings.',
    );
  }

  return {
    status: payload.status,
    active_provider: payload.active_provider,
  };
}

export async function getAgentSettings(passkey: string): Promise<AgentSettings> {
  const safePasskey = ensurePasskey(passkey);
  const response = await fetch(buildAgentUrl('/agent/settings', safePasskey), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(await buildErrorMessage('Settings fetch failed', response));
  }

  const payload = await parseJsonResponse(response);
  return parseSettingsPayload(payload);
}

export async function switchAgentProvider(
  passkey: string,
  provider: string,
): Promise<ProviderSwitchResponse> {
  const safePasskey = ensurePasskey(passkey);
  const safeProvider = ensureProvider(provider);

  const response = await fetch(buildAgentUrl('/agent/settings/provider', safePasskey), {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ provider: safeProvider }),
  });

  if (!response.ok) {
    throw new Error(await buildErrorMessage('Provider switch failed', response));
  }

  const payload = await parseJsonResponse(response);
  return parseSwitchPayload(payload);
}
