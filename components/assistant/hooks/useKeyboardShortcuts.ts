'use client';

import { useEffect } from 'react';
import { useCanvasContext } from '@/components/assistant/hooks/useCanvasContext';

export function useKeyboardShortcuts(): void {
  const { dispatch } = useCanvasContext();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const target = event.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return;
      }

      const hasModifier = event.metaKey || event.ctrlKey;
      if (!hasModifier) return;

      if (event.shiftKey) {
        switch (event.key.toUpperCase()) {
          case 'F':
            event.preventDefault();
            dispatch({ type: 'SET_CANVAS_PANEL', collapsed: true });
            dispatch({ type: 'SET_CHAT_PANEL', collapsed: false });
            break;
          case 'C':
            event.preventDefault();
            dispatch({ type: 'SET_CHAT_PANEL', collapsed: true });
            dispatch({ type: 'SET_CANVAS_PANEL', collapsed: false });
            break;
          case 'W':
            event.preventDefault();
            dispatch({ type: 'SET_CHAT_PANEL', collapsed: false });
            dispatch({ type: 'SET_CANVAS_PANEL', collapsed: false });
            break;
          default:
            break;
        }
        return;
      }

      switch (event.key.toUpperCase()) {
        case 'B':
          event.preventDefault();
          dispatch({ type: 'TOGGLE_SIDEBAR' });
          break;
        case 'K':
          event.preventDefault();
          break;
        default:
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]);
}
