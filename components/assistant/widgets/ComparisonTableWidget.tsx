'use client';

import { useTranslations } from 'next-intl';
import type { WidgetProps } from '../types';
import { useComparisonBanks } from '../hooks/useAssistantData';
import type { BankComparisonRow } from '../data/assistantDataService';
import WidgetShell from './WidgetShell';
import styles from '../assistant.module.css';

type BankRow = BankComparisonRow;

const METRIC_LABELS: { key: keyof BankRow; label: string }[] = [
  { key: 'location', label: 'Location' },
  { key: 'status', label: 'Status' },
  { key: 'founded', label: 'Founded' },
  { key: 'employees', label: 'Employees' },
  { key: 'users', label: 'Users' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'assets', label: 'Total Assets' },
  { key: 'roe', label: 'ROE' },
  { key: 'costToIncome', label: 'Cost/Income' },
  { key: 'nplRatio', label: 'NPL Ratio' },
  { key: 'license', label: 'License Type' },
];

function highlightBest(values: string[], metricKey: string): number {
  const lowerBetter = ['costToIncome', 'nplRatio'];
  const nums = values.map((v) => {
    const n = parseFloat(v.replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? null : n;
  });
  if (nums.every((n) => n === null)) return -1;
  const validNums = nums.filter((n): n is number => n !== null);
  if (validNums.length === 0) return -1;
  const target = lowerBetter.includes(metricKey) ? Math.min(...validNums) : Math.max(...validNums);
  return nums.indexOf(target);
}

export default function ComparisonTableWidget({
  instance,
  onInlineChat,
  onPin,
  onClose,
  onMaximize,
  onConfigure,
}: WidgetProps) {
  const t = useTranslations('Assistant');
  const { banks: fetchedBanks } = useComparisonBanks(instance.props?.bankSortIds);

  const banks = instance.props?.banks ?? fetchedBanks;

  return (
    <WidgetShell
      title={instance.title}
      widgetType={instance.type}
      pinned={instance.pinned}
      accentColor="#8b5cf6"
      onInlineChat={() => onInlineChat({
        component: 'comparison-table',
        banks: banks.map((b: BankRow) => b.name),
      })}
      onPin={onPin}
      onConfigure={onConfigure}
      onMaximize={onMaximize}
      onClose={onClose}
    >
      <div className={styles.compTableWrapper}>
        <table className={styles.compTable}>
          <thead>
            <tr>
              <th className={styles.compTableMetricCol}></th>
              {banks.map((bank: BankRow) => (
                <th key={bank.name} className={styles.compTableBankCol}>
                  <div className={styles.compTableBankName}>{bank.name}</div>
                  <span className={`${styles.compTableStatus} ${bank.status === 'Live' ? styles.compTableStatusLive : ''}`}>
                    {bank.status}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRIC_LABELS.filter((m) => m.key !== 'status').map((metric) => {
              const values = banks.map((b: BankRow) => b[metric.key]);
              const bestIdx = highlightBest(values, metric.key);
              return (
                <tr key={metric.key}>
                  <td className={styles.compTableMetricLabel}>{metric.label}</td>
                  {banks.map((bank: BankRow, idx: number) => (
                    <td
                      key={bank.name}
                      className={`${styles.compTableCell} ${idx === bestIdx ? styles.compTableCellBest : ''}`}
                    >
                      {bank[metric.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </WidgetShell>
  );
}
