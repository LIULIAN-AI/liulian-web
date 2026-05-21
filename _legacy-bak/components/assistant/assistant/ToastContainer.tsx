'use client';

import { X, Undo2 } from 'lucide-react';
import { useCanvasContext } from './hooks/useCanvasContext';
import styles from './assistant.module.css';

export default function ToastContainer() {
  const { state, dispatch } = useCanvasContext();

  if (state.toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {state.toasts.map((toast) => (
        <div key={toast.id} className={styles.toastItem}>
          <span className={styles.toastMessage}>{toast.message}</span>
          {toast.undoAction && (
            <button
              className={styles.toastUndoBtn}
              onClick={() => {
                toast.undoAction?.();
                dispatch({ type: 'REMOVE_TOAST', toastId: toast.id });
              }}
            >
              <Undo2 size={12} />
              Undo
            </button>
          )}
          <button
            className={styles.toastCloseBtn}
            onClick={() => dispatch({ type: 'REMOVE_TOAST', toastId: toast.id })}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
