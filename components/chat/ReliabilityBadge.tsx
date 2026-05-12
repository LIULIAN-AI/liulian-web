'use client';

import {
  SafetyCertificateOutlined,
  BankOutlined,
  BookOutlined,
  GlobalOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReliabilityTier, ReliabilitySource } from './types';
import { badgePop } from './motion';
import styles from './chat.module.css';

interface TierDef {
  labelKey: string;
  glyph: ReactNode;
  blurbKey: string;
}

const TIER_DEFS: Record<ReliabilityTier, TierDef> = {
  verified: { labelKey: 'reliability.verified', glyph: <SafetyCertificateOutlined />, blurbKey: 'reliability.verifiedBlurb' },
  official: { labelKey: 'reliability.official', glyph: <BankOutlined />, blurbKey: 'reliability.officialBlurb' },
  reference: { labelKey: 'reliability.reference', glyph: <BookOutlined />, blurbKey: 'reliability.referenceBlurb' },
  web: { labelKey: 'reliability.webLabel', glyph: <GlobalOutlined />, blurbKey: 'reliability.webBlurb' },
  ai_generated: { labelKey: 'reliability.aiGenerated', glyph: <ExperimentOutlined />, blurbKey: 'reliability.aiGeneratedBlurb' },
};

function createProviderLabel(t: ReturnType<typeof useTranslations<'Chat'>>) {
  return (used: string | null | undefined): string | null => {
    if (!used) return null;
    switch (used) {
      case 'wikipedia':
        return t('sources.wikipedia');
      case 'duckduckgo':
        return t('sources.duckduckgo');
      case 'playwright':
        return t('reliability.playwrightBrowserScrape');
      case 'database':
        return t('sources.database');
      case 'bank_matcher':
        return t('sources.bankMatcher');
      case 'frontend_context':
        return t('sources.frontendContext');
      default:
        return used;
    }
  };
}

function tierClass(tier: ReliabilityTier): string {
  return styles[`tier_${tier}`] ?? '';
}

interface ReliabilityBadgeProps {
  tier: ReliabilityTier;
  providerUsed?: string | null;
  sources?: ReliabilitySource[];
  compact?: boolean;
}

/** Inline tier pill with a hover tooltip; used both for whole-message and
 *  per-segment attribution. The tooltip body is tier-tinted via CSS vars. */
export function ReliabilityBadge({
  tier,
  providerUsed,
  sources,
  compact = false,
}: ReliabilityBadgeProps) {
  const t = useTranslations('Chat');
  const def = TIER_DEFS[tier] ?? TIER_DEFS.ai_generated;
  const label = t(def.labelKey);
  const blurb = t(def.blurbKey);
  const providerLabel = createProviderLabel(t);
  const provider = providerLabel(providerUsed);
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      className={`${styles.reliabilityBadge} ${tierClass(tier)}`}
      variants={reduceMotion ? undefined : badgePop}
      initial="initial"
      animate="animate"
    >
      <span className={styles.reliabilityBadgeGlyph}>{def.glyph}</span>
      {!compact && <span className={styles.reliabilityBadgeLabel}>{label}</span>}
      <span className={`${styles.reliabilityTooltip} ${tierClass(tier)}`} role="tooltip">
        <span className={styles.reliabilityTooltipTitle}>
          {provider ? t('sources.via', { provider }) : label}
        </span>
        <span className={styles.reliabilityTooltipBlurb}>{blurb}</span>
        {sources && sources.length > 0 && (
          <span className={styles.reliabilityTooltipSources}>
            {sources.slice(0, 3).map((s, i) => (
              <span key={i} className={styles.reliabilityTooltipSourceRow}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.title || s.url}
                  </a>
                ) : (
                  <span>{s.title || s.provider}</span>
                )}
                {s.provider && (
                  <span className={styles.reliabilityTooltipSourceProvider}>· {providerLabel(s.provider) ?? s.provider}</span>
                )}
              </span>
            ))}
            {sources.length > 3 && (
              <span className={styles.reliabilityTooltipMore}>{t('reliability.more', { count: sources.length - 3 })}</span>
            )}
          </span>
        )}
      </span>
    </motion.span>
  );
}

export default ReliabilityBadge;
