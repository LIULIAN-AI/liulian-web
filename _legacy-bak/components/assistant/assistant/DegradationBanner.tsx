'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import styles from './assistant.module.css';

interface DegradationBannerProps {
  visible: boolean;
}

export default function DegradationBanner({ visible }: DegradationBannerProps) {
  const t = useTranslations('Assistant');

  if (!visible) return null;

  return (
    <div className={styles.degradationBanner}>
      <AlertTriangle size={14} />
      <span>{t('degradation.banner')}</span>
    </div>
  );
}
