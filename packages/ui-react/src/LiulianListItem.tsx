import { useState, type CSSProperties } from 'react';

export type ListItemVariant = 'navigation' | 'content' | 'selectable' | 'multiSelectable';

export interface LiulianListItemProps {
  primary: string;
  secondary?: string;
  leadingIcon?: string;
  variant?: ListItemVariant;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  ariaLabel?: string;
}

export function LiulianListItem({
  primary,
  secondary,
  leadingIcon,
  variant = 'content',
  selected = false,
  disabled = false,
  onPress,
  ariaLabel,
}: LiulianListItemProps) {
  const [hovered, setHovered] = useState(false);
  const isInteractive = variant !== 'content';

  const bg =
    selected && (variant === 'selectable' || variant === 'multiSelectable')
      ? 'var(--color-unibe-red-tint)'
      : hovered && isInteractive && !disabled
      ? 'var(--color-canvas-warm)'
      : 'transparent';

  const style: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    minHeight: 48,
    width: '100%',
    background: bg,
    border: 'none',
    cursor: isInteractive && !disabled ? 'pointer' : 'default',
    opacity: disabled ? 0.4 : 1,
    textAlign: 'left',
    fontFamily: 'inherit',
    color: 'inherit',
    transition: 'background-color var(--motion-duration-fast) linear',
    boxSizing: 'border-box',
  };

  const inner = (
    <>
      {leadingIcon && (
        <span
          aria-hidden
          style={{
            width: 16,
            height: 16,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fontsize-xs)',
            color: 'var(--color-ink-muted)',
          }}
        >{leadingIcon}</span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fontsize-md)',
          fontWeight: 500,
          color: 'var(--color-ink-charcoal)',
        }}>{primary}</span>
        {secondary && (
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fontsize-xs)',
            color: 'var(--color-ink-muted)',
          }}>{secondary}</span>
        )}
      </div>
      {/* trailing */}
      {variant === 'navigation' && (
        <span
          aria-hidden
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            color: 'var(--color-ink-faint)',
          }}
        >›</span>
      )}
      {variant === 'selectable' && (
        <span
          aria-hidden
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: selected ? 'var(--color-unibe-red)' : 'transparent',
            border: selected ? 'none' : '1.5px solid var(--color-hairline-strong)',
            color: 'var(--color-surface-pure)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontFamily: 'var(--font-body)',
          }}
        >{selected ? '✓' : ''}</span>
      )}
      {variant === 'multiSelectable' && (
        <span
          aria-hidden
          style={{
            width: 16,
            height: 16,
            borderRadius: 'var(--radius-sm)',
            background: selected ? 'var(--color-unibe-red)' : 'transparent',
            border: selected ? 'none' : '1.5px solid var(--color-hairline-strong)',
            color: 'var(--color-surface-pure)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontFamily: 'var(--font-body)',
          }}
        >{selected ? '✓' : ''}</span>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        style={style}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-pressed={selected}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => { if (!disabled) onPress?.(); }}
      >
        {inner}
      </button>
    );
  }
  return <div style={style}>{inner}</div>;
}
