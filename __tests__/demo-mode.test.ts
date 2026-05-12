import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { disableDemoMode, enableDemoMode, isDemoModeActive } from '@/components/chat/demo-mode';

const ORIGINAL_DEMO_ENV = process.env.NEXT_PUBLIC_DEMO_MODE;

describe('demo mode activation', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
    window.localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    if (ORIGINAL_DEMO_ENV === undefined) {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
    } else {
      process.env.NEXT_PUBLIC_DEMO_MODE = ORIGINAL_DEMO_ENV;
    }
    window.localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('activates from query param and persists to storage', () => {
    window.history.pushState({}, '', '/?demo=1');
    expect(isDemoModeActive()).toBe(true);

    window.history.pushState({}, '', '/');
    expect(isDemoModeActive()).toBe(true);
  });

  it('deactivates from query param and clears persisted state', () => {
    enableDemoMode();
    expect(isDemoModeActive()).toBe(true);

    window.history.pushState({}, '', '/?demo=0');
    expect(isDemoModeActive()).toBe(false);

    window.history.pushState({}, '', '/');
    expect(isDemoModeActive()).toBe(false);
  });

  it('always activates when NEXT_PUBLIC_DEMO_MODE=1', () => {
    disableDemoMode();
    process.env.NEXT_PUBLIC_DEMO_MODE = '1';
    expect(isDemoModeActive()).toBe(true);
  });
});
