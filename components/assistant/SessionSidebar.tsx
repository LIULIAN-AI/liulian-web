'use client';

import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PlusOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { useChatContext } from '@/components/chat/hooks/useChatContext';
import { useCanvasContext } from './hooks/useCanvasContext';
import styles from './assistant.module.css';

export default function SessionSidebar() {
  const t = useTranslations('Assistant');
  const { state: chatState, startNewChat, loadArchive } = useChatContext();
  const { state: canvasState, toggleSidebar } = useCanvasContext();
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Collapsed Icon Bar — always visible */}
      <div className={styles.iconBar}>
        <button
          className={styles.iconBarButton}
          onClick={toggleSidebar}
          aria-label={t('sidebar.toggle')}
          title={t('sidebar.toggle')}
        >
          ☰
        </button>
        <button
          className={styles.iconBarButton}
          onClick={startNewChat}
          aria-label={t('sidebar.newChat')}
          title={t('sidebar.newChat')}
        >
          <PlusOutlined />
        </button>
        <button
          className={styles.iconBarButton}
          aria-label={t('sidebar.search')}
          title={t('sidebar.search')}
        >
          <SearchOutlined />
        </button>

        <div className={styles.iconBarDivider} />

        {/* Session number indicators */}
        <button
          className={`${styles.iconBarButton} ${styles.iconBarButtonActive}`}
          aria-label={t('sidebar.currentSession')}
          title={chatState.conversationTitle ?? t('sidebar.currentSession')}
        >
          1
        </button>
        {chatState.archives.slice(0, 3).map((archive, i) => (
          <button
            key={archive.conversationId}
            className={styles.iconBarButton}
            onClick={() => loadArchive(archive.conversationId)}
            aria-label={archive.title}
            title={archive.title}
          >
            {i + 2}
          </button>
        ))}

        <div className={styles.iconBarSpacer} />

        <button
          className={styles.iconBarButton}
          aria-label={t('sidebar.settings')}
          title={t('sidebar.settings')}
        >
          ⚙
        </button>
      </div>

      {/* Expanded Overlay — slides in from left */}
      <AnimatePresence>
        {canvasState.sessionSidebarExpanded && (
          <motion.div
            className={styles.sidebarOverlay}
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className={styles.sidebarHeader}>
              <div className={styles.sidebarTitle}>{t('sidebar.title')}</div>
              <button
                className={styles.widgetHeaderAction}
                onClick={toggleSidebar}
                aria-label={t('sidebar.close')}
              >
                <CloseOutlined />
              </button>
            </div>

            <div style={{ padding: '8px 12px' }}>
              <button
                className={styles.iconBarButton}
                onClick={() => {
                  startNewChat();
                  toggleSidebar();
                }}
                style={{ width: '100%', justifyContent: 'flex-start', gap: 8, fontSize: 12 }}
              >
                <PlusOutlined /> {t('sidebar.newChat')}
              </button>
            </div>

            <div className={styles.sidebarList}>
              {/* Current session */}
              <div className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}>
                <div className={styles.sidebarItemTitle}>
                  {chatState.conversationTitle ?? t('sidebar.currentSession')}
                </div>
                <div className={styles.sidebarItemMeta}>
                  {t('sidebar.messageCount', { count: chatState.messages.length })}
                </div>
              </div>

              {/* Archived sessions */}
              {chatState.archives.map((archive) => (
                <button
                  key={archive.conversationId}
                  className={styles.sidebarItem}
                  onClick={() => {
                    loadArchive(archive.conversationId);
                    toggleSidebar();
                  }}
                >
                  <div className={styles.sidebarItemTitle}>
                    {archive.pinned ? '📌 ' : ''}{archive.title}
                  </div>
                  <div className={styles.sidebarItemMeta}>
                    {t('sidebar.messageCount', { count: archive.messages.length })}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
