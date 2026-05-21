'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { WidgetProps } from '../types';
import { useProducts } from '../hooks/useAssistantData';
import { getSelectedBankSortId } from '../data/assistantDataService';
import type { ProductEntry } from '../data/assistantDataService';
import WidgetShell from './WidgetShell';
import styles from '../assistant.module.css';

type ProductItem = ProductEntry;

const TYPE_ICONS: Record<string, string> = {
  Account: '🏦',
  Card: '💳',
  Deposit: '💰',
  Loan: '📋',
  Insurance: '🛡️',
};

const SEGMENT_FILTERS = ['All', 'Retail', 'Corporate'] as const;

export default function ProductListWidget({
  instance,
  onInlineChat,
  onPin,
  onClose,
  onMaximize,
  onConfigure,
}: WidgetProps) {
  const t = useTranslations('Assistant');
  const [filter, setFilter] = useState<string>('All');
  const { products: fetchedProducts } = useProducts(instance.props?.bankSortId ?? getSelectedBankSortId());

  const products: ProductItem[] = instance.props?.products ?? fetchedProducts;

  const filtered = filter === 'All'
    ? products
    : products.filter((p) => p.customerSegment === filter.toLowerCase());

  return (
    <WidgetShell
      title={instance.title}
      widgetType={instance.type}
      pinned={instance.pinned}
      accentColor="#10b981"
      onInlineChat={() => onInlineChat({
        component: 'product-list',
        productCount: products.length,
        types: [...new Set(products.map((p) => p.productType))],
      })}
      onPin={onPin}
      onConfigure={onConfigure}
      onMaximize={onMaximize}
      onClose={onClose}
    >
      <div className={styles.productListBody}>
        <div className={styles.productFilterRow}>
          {SEGMENT_FILTERS.map((seg) => (
            <button
              key={seg}
              type="button"
              className={`${styles.biChartChip} ${filter === seg ? styles.biChartChipActive : ''}`}
              onClick={() => setFilter(seg)}
            >
              {seg}
            </button>
          ))}
          <span className={styles.productCount}>{filtered.length} products</span>
        </div>
        <div className={styles.productListScroll}>
          {filtered.map((product) => (
            <div key={product.productName} className={styles.productCard}>
              <div className={styles.productCardHeader}>
                <span className={styles.productIcon}>{TYPE_ICONS[product.productType] ?? '🏷️'}</span>
                <span className={styles.productName}>{product.productName}</span>
                <span className={styles.productTypeBadge}>{product.productType}</span>
                <span className={styles.productSegmentBadge} data-segment={product.customerSegment}>
                  {product.clientTag}
                </span>
              </div>
              <div className={styles.productDesc}>{product.productDescription}</div>
            </div>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}
