'use client';

import { useTranslations } from 'next-intl';
import { useBankContext } from '@/contexts/BankContext';
import { useChatContext } from '@/components/chat/hooks/useChatContext';
import type { WidgetProps } from '../types';
import WidgetShell from './WidgetShell';
import styles from '../assistant.module.css';

interface Suggestion {
  icon: string;
  text: string;
}

function buildSuggestions(
  bankName: string | null,
  hasMessages: boolean,
): Suggestion[] {
  if (bankName) {
    return [
      { icon: '⚖️', text: `Compare ${bankName} with competitors` },
      { icon: '📈', text: `Show ${bankName} financial trends` },
      { icon: '🏷️', text: `View ${bankName} product offerings` },
      { icon: '👥', text: `Analyze ${bankName} management team` },
      { icon: '📰', text: `Check latest news about ${bankName}` },
    ];
  }

  if (hasMessages) {
    return [
      { icon: '🔍', text: 'Search for a bank to analyze' },
      { icon: '⚖️', text: 'Compare digital banks in Hong Kong' },
      { icon: '🌐', text: 'Show market overview' },
    ];
  }

  return [
    { icon: '💬', text: 'Who is the CEO of HSBC?' },
    { icon: '⚖️', text: 'Compare DBS and OCBC' },
    { icon: '🏦', text: 'Show me virtual banks in Hong Kong' },
  ];
}

export default function AISuggestionsWidget({
  instance,
  onInlineChat,
  onPin,
  onClose,
  onMaximize,
}: WidgetProps) {
  const t = useTranslations('Assistant');
  const { headerInfo } = useBankContext();
  const { state, sendMessage } = useChatContext();

  const bankName = headerInfo?.companyName ?? null;
  const hasMessages = state.messages.length > 0;
  const suggestions = buildSuggestions(bankName, hasMessages);

  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
  };

  return (
    <WidgetShell
      title={instance.title}
      widgetType={instance.type}
      pinned={instance.pinned}
      accentColor="var(--accent)"
      onInlineChat={() => onInlineChat(instance.props)}
      onPin={onPin}
      onMaximize={onMaximize}
      onClose={onClose}
    >
      {suggestions.length === 0 ? (
        <div className={styles.suggestionsEmpty}>
          {t('widget.suggestions.empty')}
        </div>
      ) : (
        <ul className={styles.suggestionsList}>
          {suggestions.map((s) => (
            <li key={s.text}>
              <button
                className={styles.suggestionItem}
                onClick={() => handleSuggestionClick(s.text)}
                type="button"
              >
                <span className={styles.suggestionIcon}>{s.icon}</span>
                <span className={styles.suggestionText}>{s.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}
