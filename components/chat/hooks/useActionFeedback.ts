import { useCallback, useEffect, useRef, useState } from 'react';

export type FeedbackStatus = 'idle' | 'success' | 'error';

/** Fire-and-auto-reset feedback signal for one-shot actions (copy, export, save).
 *  Pair with a tooltip and an icon swap to give the user a quick "yes, it
 *  happened" confirmation that decays back to idle without intervention. */
export function useActionFeedback(resetMs = 1500) {
  const [status, setStatus] = useState<FeedbackStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = useCallback(
    (next: 'success' | 'error' = 'success') => {
      setStatus(next);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setStatus('idle'), resetMs);
    },
    [resetMs],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { status, fire };
}
