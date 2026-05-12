'use client';

import { useTranslations } from 'next-intl';
import { LinkOutlined } from '@ant-design/icons';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReliabilitySource } from './types';
import { componentLabel } from './contextI18n';
import { sourceItem, sourceList, tweenIOS } from './motion';
import styles from './chat.module.css';

interface SourcesFooterProps {
  sources: ReliabilitySource[];
  providerUsed?: string | null;
}

function createProviderLabel(t: ReturnType<typeof useTranslations<'Chat'>>) {
  return (p: string | null | undefined): string | null => {
    if (!p) return null;
    switch (p) {
      case 'wikipedia':
        return t('sources.wikipedia');
      case 'duckduckgo':
        return t('sources.duckduckgo');
      case 'playwright':
        return t('sources.playwrightScrape');
      case 'database':
        return t('sources.database');
      case 'bank_matcher':
        return t('sources.bankMatcher');
      case 'frontend_context':
        return t('sources.frontendContext');
      default:
        return p;
    }
  };
}

function createTypeLabel(t: ReturnType<typeof useTranslations<'Chat'>>) {
  return (provider: string): string => {
    switch (provider) {
      case 'database':
        return t('sources.internalDB');
      case 'bank_matcher':
        return t('sources.aiMatcher');
      case 'frontend_context':
        return t('sources.contextCard');
      case 'wikipedia':
        return t('sources.wikipedia');
      case 'duckduckgo':
        return t('sources.web');
      case 'playwright':
        return t('sources.webScrape');
      default:
        return provider || t('sources.source');
    }
  };
}

function domainFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname;
    return host.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function contentLabel(source: ReliabilitySource, t: ReturnType<typeof useTranslations<'Chat'>>): string {
  const title = source.title || '';
  if (source.provider === 'database' || source.provider === 'frontend_context') {
    const idx = title.indexOf('—');
    if (idx >= 0) {
      const raw = title.slice(idx + 1).trim();
      return componentLabel(t, raw);
    }
  }
  return title || (source.url ? domainFromUrl(source.url) : source.provider);
}

export default function SourcesFooter({ sources, providerUsed }: SourcesFooterProps) {
  const t = useTranslations('Chat');
  const reduceMotion = useReducedMotion();
  if (!sources.length) return null;
  const providerLabel = createProviderLabel(t);
  const typeLabel = createTypeLabel(t);
  const topProvider = providerLabel(providerUsed);
  return (
    <motion.div
      className={styles.sourcesFooter}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={tweenIOS}
    >
      <div className={styles.sourcesFooterHeader}>
        <LinkOutlined />
        <span>{topProvider ? t('sources.via', { provider: topProvider }) : t('sources.header')}</span>
      </div>
      <motion.ul
        className={styles.sourcesFooterList}
        variants={reduceMotion ? undefined : sourceList}
        initial="initial"
        animate="animate"
      >
        {sources.map((s, i) => {
          const domain = s.url ? domainFromUrl(s.url) : '';
          const type = typeLabel(s.provider);
          const content = contentLabel(s, t);
          return (
            <motion.li
              key={i}
              className={styles.sourcesFooterItem}
              variants={reduceMotion ? undefined : sourceItem}
              data-source-row={i + 1}
            >
              <span className={`${styles.sourcesFooterDot} ${styles[`tier_${s.tier}`] ?? ''}`} />
              <span
                className={`${styles.sourcesFooterType} ${styles[`tier_${s.tier}`] ?? ''}`}
                title={providerLabel(s.provider) ?? s.provider}
              >
                {type}
              </span>
              {s.url ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.sourcesFooterContent}
                  title={s.url}
                >
                  {content}
                </a>
              ) : (
                <span className={styles.sourcesFooterContent}>{content}</span>
              )}
              {domain && (
                <span className={styles.sourcesFooterDomain}>{domain}</span>
              )}
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.div>
  );
}
