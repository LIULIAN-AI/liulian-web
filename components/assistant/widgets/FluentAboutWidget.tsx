'use client';

import type { WidgetProps } from '../types';
import { getMockBank } from '../data/mockBanks';
import { getSelectedBankSortId } from '../data/assistantDataService';
import FluentAbout from '../fluent/FluentAbout';
import WidgetShell from './WidgetShell';

export default function FluentAboutWidget({
  instance,
  onInlineChat,
  onPin,
  onClose,
  onMaximize,
  onConfigure,
}: WidgetProps) {
  const bankSortId = instance.props?.bankSortId ?? getSelectedBankSortId();
  const bankData = getMockBank(bankSortId);

  if (!bankData) {
    return (
      <WidgetShell
        title={instance.title}
        widgetType={instance.type}
        pinned={instance.pinned}
        onPin={onPin}
        onClose={onClose}
      >
        <div style={{ padding: 16, color: '#71717A' }}>Bank not found: {bankSortId}</div>
      </WidgetShell>
    );
  }

  const { about, header, owners } = bankData;

  return (
    <WidgetShell
      title={instance.title}
      widgetType={instance.type}
      pinned={instance.pinned}
      accentColor="#6366f1"
      onInlineChat={() => onInlineChat({
        component: 'fluent-about',
        bankName: header.companyName,
        sortId: bankSortId,
      })}
      onPin={onPin}
      onConfigure={onConfigure}
      onMaximize={onMaximize}
      onClose={onClose}
    >
      <FluentAbout
        sortId={bankSortId}
        companyId={bankSortId}
        bankName={header.companyName}
        ceo={about.ceo}
        companySize={about.companySize}
        establishedTime={about.establishedTime}
        founder={about.founder}
        revenue={about.revenue}
        location={about.location}
        bankSwift={about.bankSwift}
        bankCode={about.bankCode}
        owners={owners}
        compact
      />
    </WidgetShell>
  );
}
