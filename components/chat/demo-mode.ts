const STORAGE_KEY = 'liulian_demo_mode';

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function persistDemoMode(value: boolean): void {
  if (!canUseBrowserStorage()) return;
  try {
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage exceptions (private mode, disabled storage).
  }
}

export function isDemoModeActive(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === '1') {
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  const demoParam = params.get('demo');
  if (demoParam === '1') {
    persistDemoMode(true);
    return true;
  }
  if (demoParam === '0') {
    persistDemoMode(false);
    return false;
  }

  if (!canUseBrowserStorage()) {
    return false;
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function enableDemoMode(): void {
  persistDemoMode(true);
}

export function disableDemoMode(): void {
  persistDemoMode(false);
}
