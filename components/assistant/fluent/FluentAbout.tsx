'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useChatContext } from '@/components/chat/hooks/useChatContext';
import { ProfessionalPersonaIcon, pickRandomPersona, type PersonaType } from '@/components/chat/ProfessionalPersonaIcon';
import chatStyles from '@/components/chat/chat.module.css';
import styles from './fluent.module.css';

interface Owner {
  name?: string;
  percent?: number;
  website?: string;
}

export interface FluentAboutProps {
  sortId: string;
  companyId: string;
  bankName: string;
  ceo: string;
  companySize: string;
  establishedTime: string;
  founder: string;
  revenue: string;
  location: string;
  bankSwift: string;
  bankCode: string;
  owners: Owner[];
  compact?: boolean;
}

export default function FluentAbout({
  sortId,
  companyId,
  bankName,
  ceo,
  companySize,
  establishedTime,
  founder,
  revenue,
  location,
  bankSwift,
  bankCode,
  owners,
  compact = false,
}: FluentAboutProps) {
  const t = useTranslations('BankInfo');
  const { injectContext } = useChatContext();
  const [aboutPersona] = useState<PersonaType>(() => pickRandomPersona());
  const [establishmentPersona] = useState<PersonaType>(() => pickRandomPersona());

  const handleOwnerClick = useCallback((owner?: Owner) => {
    if (owner?.website) {
      window.open(owner.website, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const renderOwner = useCallback((owner: Owner | undefined, className: string) => {
    const ownerName = owner?.name || '';
    const ownerText = `${ownerName}${owner?.percent ? ` (${owner.percent}%)` : ''}`;
    const hasLink = !!owner?.website;

    return (
      <div
        className={className}
        onClick={() => handleOwnerClick(owner)}
        onKeyDown={(e) => {
          if (!hasLink) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOwnerClick(owner);
          }
        }}
        role={hasLink ? 'link' : undefined}
        tabIndex={hasLink ? 0 : undefined}
        style={{ cursor: hasLink ? 'pointer' : 'default' }}
      >
        {ownerText}
      </div>
    );
  }, [handleOwnerClick]);

  return (
    <div className={`${styles.aboutRoot} ${compact ? styles.aboutCompact : ''} ${chatStyles.botIconContainer}`}>
      <button
        className={chatStyles.botIcon}
        aria-label="Inject about context"
        onClick={() => injectContext('about', {
          source: 'frontend_snapshot',
          sortId,
          companyId,
          bankName,
          ceo,
          location,
          revenue,
          companySize,
          bankCode,
          bankSwift,
        })}
      >
        <ProfessionalPersonaIcon persona={aboutPersona} />
      </button>

      <div className={styles.aboutTitle}>{t('about')}</div>

      <div className={styles.aboutItem}>
        <div className={styles.aboutItemTitle}>{t('location')}</div>
        <div className={styles.aboutItemContent}>{location}</div>
      </div>
      <div className={styles.aboutItem}>
        <div className={styles.aboutItemTitle}>{t('bankCode')}</div>
        <div className={styles.aboutItemContent}>{bankCode}</div>
      </div>
      <div className={styles.aboutItem}>
        <div className={styles.aboutItemTitle}>{t('bankSwift')}</div>
        <div className={styles.aboutItemContent}>{bankSwift}</div>
      </div>
      <div className={`${styles.aboutItem} ${styles.aboutItemLast}`}>
        <div className={styles.aboutItemTitle}>{t('revenue')}</div>
        <div className={styles.aboutItemContent}>{revenue}</div>
      </div>

      <div className={`${styles.aboutEstablishmentSection} ${chatStyles.botIconContainer}`}>
        <button
          className={chatStyles.botIcon}
          aria-label="Inject establishment context"
          onClick={() => injectContext('establishment', {
            source: 'frontend_snapshot',
            sortId,
            companyId,
            bankName,
            establishedTime,
            founder,
            owners: owners
              .filter((o) => o?.name)
              .map((o) => (o.percent != null ? `${o.name} (${o.percent}%)` : o.name!))
              .join('; '),
          })}
        >
          <ProfessionalPersonaIcon persona={establishmentPersona} />
        </button>

        <div className={styles.aboutSubTitle}>{t('establishment')}</div>

        <div className={styles.aboutItem}>
          <div className={styles.aboutItemTitle}>{t('establishedTime')}</div>
          <div className={styles.aboutItemContent}>{establishedTime}</div>
        </div>
        <div className={styles.aboutItem}>
          <div className={styles.aboutItemTitle}>{t('founder')}</div>
          <div className={styles.aboutItemContent}>{founder}</div>
        </div>
        <div className={`${styles.aboutItem} ${styles.aboutItemStart}`}>
          <div className={styles.aboutItemTitle}>{t('Owners')}</div>
          <div className={`${styles.aboutItemContent} ${styles.aboutItemContentOwners}`}>
            {owners.length === 0 ? (
              <div className={styles.aboutItemContentTop}>No owners information available</div>
            ) : owners.length === 1 ? (
              renderOwner(owners[0], styles.aboutItemContentTop)
            ) : (
              <>
                {renderOwner(owners[0], styles.aboutItemContentTop)}
                {renderOwner(owners[1], styles.aboutItemContentBottom)}
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.aboutSubTitle}>{t('staff')}</div>

      <div className={styles.aboutItem}>
        <div className={styles.aboutItemTitle}>{t('ceo')}</div>
        <div className={styles.aboutItemContent}>{ceo}</div>
      </div>
      <div className={styles.aboutItem}>
        <div className={styles.aboutItemTitle}>{t('companySize')}</div>
        <div className={styles.aboutItemContent}>{companySize}</div>
      </div>
    </div>
  );
}
