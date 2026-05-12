'use client';

import { useState, useEffect } from 'react';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import ChatPanel from '@/components/chat/ChatPanel';
import { pickRandomPersona, type PersonaType } from '@/components/chat/ProfessionalPersonaIcon';
import HeaderBar from '@/components/assistant/HeaderBar';
import SessionSidebar from '@/components/assistant/SessionSidebar';
import DynamicCanvas from '@/components/assistant/DynamicCanvas';
import CanvasOrchestrator from '@/components/assistant/CanvasOrchestrator';
import StatusBar from '@/components/assistant/StatusBar';
import ToastContainer from '@/components/assistant/ToastContainer';
import DegradationBanner from '@/components/assistant/DegradationBanner';
import { useCanvasContext } from '@/components/assistant/hooks/useCanvasContext';
import { useKeyboardShortcuts } from '@/components/assistant/hooks/useKeyboardShortcuts';
import type { WidgetInstance } from '@/components/assistant/types';
import styles from '@/components/assistant/assistant.module.css';

const DEFAULT_WIDGETS: WidgetInstance[] = [
  {
    id: 'welcome-suggestions',
    type: 'ai-suggestions',
    title: 'Recommended',
    props: {},
    pinned: false,
    priority: 'default',
  },
  {
    id: 'welcome-snapshot',
    type: 'bank-snapshot',
    title: 'Bank Overview',
    props: {},
    pinned: false,
    priority: 'default',
  },
  {
    id: 'welcome-chart',
    type: 'bi-chart',
    title: 'Analytics',
    props: {},
    pinned: false,
    priority: 'default',
  },
  {
    id: 'welcome-comparison',
    type: 'comparison-table',
    title: 'Peer Comparison',
    props: {},
    pinned: false,
    priority: 'default',
  },
  {
    id: 'welcome-platform',
    type: 'platform-embed',
    title: 'Platform Components',
    props: {},
    pinned: false,
    priority: 'default',
  },
];

export default function AssistantPage() {
  const [persona] = useState<PersonaType>(() => pickRandomPersona());
  const { state, dispatch, toggleChatPanel, toggleCanvasPanel } = useCanvasContext();
  useKeyboardShortcuts();

  useEffect(() => {
    if (state.activeWidgets.length === 0) {
      dispatch({ type: 'SET_ACTIVE_WIDGETS', widgets: DEFAULT_WIDGETS });
    }
  }, []);

  return (
    <div className={styles.assistantRoot}>
      <CanvasOrchestrator />
      <HeaderBar />

      <div className={styles.assistantMain}>
        <SessionSidebar />

        <div className={styles.workspaceContainer}>
          {!state.chatCollapsed && (
            <div className={`${styles.chatPanel} ${state.canvasCollapsed ? styles.chatPanelFull : ''}`}>
              <div className={styles.chatPanelHeader}>
                <span className={styles.chatPanelTitle}>Chat</span>
                <button
                  className={styles.panelCollapseBtn}
                  onClick={toggleChatPanel}
                  title="Collapse chat"
                >
                  <PanelLeftClose size={16} />
                </button>
              </div>
              <DegradationBanner visible={state.aiUnavailable} />
              <ChatPanel persona={persona} standalone />
            </div>
          )}

          {!state.canvasCollapsed && (
            <div className={styles.canvasPanel}>
              <div className={styles.canvasPanelHeader}>
                <span className={styles.canvasPanelTitle}>Canvas</span>
                <button
                  className={styles.panelCollapseBtn}
                  onClick={toggleCanvasPanel}
                  title="Collapse canvas"
                >
                  <PanelRightClose size={16} />
                </button>
              </div>
              <DynamicCanvas />
            </div>
          )}
        </div>

        {(state.chatCollapsed || state.canvasCollapsed) && (
          <div className={styles.collapsedBar}>
            {state.chatCollapsed && (
              <button
                className={styles.collapsedBarBtn}
                onClick={toggleChatPanel}
                title="Show chat"
              >
                <PanelLeftClose size={16} style={{ transform: 'rotate(180deg)' }} />
                <span>Chat</span>
              </button>
            )}
            {state.canvasCollapsed && (
              <button
                className={`${styles.collapsedBarBtn} ${state.canvasBadgeCount > 0 ? styles.collapsedBarBtnBadge : ''}`}
                onClick={() => {
                  toggleCanvasPanel();
                  dispatch({ type: 'SET_CANVAS_BADGE', count: 0 });
                }}
                title="Show canvas"
              >
                <PanelRightClose size={16} style={{ transform: 'rotate(180deg)' }} />
                <span>Canvas</span>
                {state.canvasBadgeCount > 0 && (
                  <span className={styles.canvasBadge}>{state.canvasBadgeCount}</span>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <StatusBar />
      <ToastContainer />
    </div>
  );
}
