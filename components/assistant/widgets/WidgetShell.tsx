'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Tooltip } from 'antd';
import { MessageSquare, Maximize2, Minimize2, X, Settings, Pin } from 'lucide-react';
import SmartSwitcherDock from '../SmartSwitcherDock';
import { useCanvasContext } from '../hooks/useCanvasContext';
import type { WidgetType } from '../types';
import styles from '../assistant.module.css';

interface WidgetShellProps {
  title: string;
  widgetType?: WidgetType;
  pinned?: boolean;
  accentColor?: string;
  onInlineChat?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onConfigure?: () => void;
  onPin?: () => void;
  children: ReactNode;
}

export default function WidgetShell({
  title,
  widgetType,
  pinned,
  accentColor,
  onInlineChat,
  onMaximize,
  onClose,
  onConfigure,
  onPin,
  children,
}: WidgetShellProps) {
  const t = useTranslations('Assistant');
  const { state: canvasState } = useCanvasContext();
  const [dockVisible, setDockVisible] = useState(false);
  const aiDown = canvasState.aiUnavailable;
  const isMaximized = !!canvasState.maximizedWidgetId;

  return (
    <div
      className={styles.widgetShell}
      onMouseEnter={() => setDockVisible(true)}
      onMouseLeave={() => setDockVisible(false)}
    >
      {accentColor && (
        <div className={styles.widgetAccentBar} style={{ background: accentColor }} />
      )}
      <div className={styles.widgetHeader}>
        <div className={styles.widgetHeaderTitle}>
          {pinned && <Pin size={10} className={styles.widgetPinIndicator} />}
          {title}
        </div>
        <div className={styles.widgetHeaderActions}>
          {onInlineChat && (
            <Tooltip title={aiDown ? 'AI unavailable' : t('widget.inlineChat')}>
              <button
                className={`${styles.widgetHeaderAction} ${aiDown ? styles.widgetHeaderActionDisabled : ''}`}
                onClick={aiDown ? undefined : onInlineChat}
                disabled={aiDown}
                aria-label={t('widget.inlineChat')}
              >
                <MessageSquare size={12} />
              </button>
            </Tooltip>
          )}
          {onConfigure && (
            <Tooltip title="Configure">
              <button
                className={styles.widgetHeaderAction}
                onClick={onConfigure}
                aria-label="Configure"
              >
                <Settings size={12} />
              </button>
            </Tooltip>
          )}
          {onPin && (
            <Tooltip title={pinned ? 'Unpin' : 'Pin'}>
              <button
                className={`${styles.widgetHeaderAction} ${pinned ? styles.widgetHeaderActionActive : ''}`}
                onClick={onPin}
                aria-label={pinned ? 'Unpin' : 'Pin'}
              >
                <Pin size={12} />
              </button>
            </Tooltip>
          )}
          {onMaximize && (
            <Tooltip title={isMaximized ? 'Restore' : t('widget.maximize')}>
              <button
                className={styles.widgetHeaderAction}
                onClick={onMaximize}
                aria-label={isMaximized ? 'Restore' : t('widget.maximize')}
              >
                {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
            </Tooltip>
          )}
          {onClose && (
            <Tooltip title={t('widget.close')}>
              <button
                className={styles.widgetHeaderAction}
                onClick={onClose}
                aria-label={t('widget.close')}
              >
                <X size={12} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
      <div className={styles.widgetBody}>{children}</div>
      {widgetType && (
        <SmartSwitcherDock widgetType={widgetType} visible={dockVisible} />
      )}
    </div>
  );
}
