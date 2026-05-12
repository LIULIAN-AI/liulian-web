import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useActionFeedback } from '@/components/chat/hooks/useActionFeedback';

describe('useActionFeedback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('starts with idle status', () => {
    const { result } = renderHook(() => useActionFeedback());
    expect(result.current.status).toBe('idle');
  });

  it('fire() sets status to success by default', () => {
    const { result } = renderHook(() => useActionFeedback());
    act(() => result.current.fire());
    expect(result.current.status).toBe('success');
  });

  it('fire("error") sets status to error', () => {
    const { result } = renderHook(() => useActionFeedback());
    act(() => result.current.fire('error'));
    expect(result.current.status).toBe('error');
  });

  it('resets back to idle after resetMs', () => {
    const { result } = renderHook(() => useActionFeedback(500));
    act(() => result.current.fire());
    expect(result.current.status).toBe('success');
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.status).toBe('idle');
  });

  it('uses default 1500ms reset', () => {
    const { result } = renderHook(() => useActionFeedback());
    act(() => result.current.fire());
    act(() => vi.advanceTimersByTime(1499));
    expect(result.current.status).toBe('success');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.status).toBe('idle');
  });

  it('re-firing resets the timer', () => {
    const { result } = renderHook(() => useActionFeedback(1000));
    act(() => result.current.fire());
    act(() => vi.advanceTimersByTime(800));
    expect(result.current.status).toBe('success');
    act(() => result.current.fire('error'));
    expect(result.current.status).toBe('error');
    act(() => vi.advanceTimersByTime(800));
    expect(result.current.status).toBe('error');
    act(() => vi.advanceTimersByTime(200));
    expect(result.current.status).toBe('idle');
  });

  it('cleans up timer on unmount', () => {
    const { result, unmount } = renderHook(() => useActionFeedback(1000));
    act(() => result.current.fire());
    unmount();
    expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
  });
});
