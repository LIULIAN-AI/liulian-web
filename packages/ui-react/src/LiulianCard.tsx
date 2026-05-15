import { useState, type CSSProperties, type ReactNode } from 'react';

export type CardSize = 'compact' | 'default' | 'spacious';

export interface LiulianCardProps {
  size?: CardSize;
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  onPress?: () => void;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

const PADDING: Record<CardSize, string> = {
  compact: 'var(--spacing-4)',
  default: 'var(--spacing-6)',
  spacious: 'var(--spacing-7)',
};

const GAP: Record<CardSize, string> = {
  compact: 'var(--spacing-3)',
  default: 'var(--spacing-4)',
  spacious: 'var(--spacing-5)',
};

export function LiulianCard({
  size = 'default',
  interactive = false,
  selected = false,
  disabled = false,
  ariaLabel,
  onPress,
  header,
  footer,
  children,
}: LiulianCardProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const borderColor = selected
    ? 'var(--color-unibe-red)'
    : hovered && interactive
    ? 'var(--color-hairline-strong)'
    : 'var(--color-hairline)';
  const borderWidth = selected ? 2 : 1;

  const style: CSSProperties = {
    padding: PADDING[size],
    background: 'var(--color-surface-pure)',
    border: `${borderWidth}px solid ${borderColor}`,
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: GAP[size],
    cursor: interactive && !disabled ? 'pointer' : 'default',
    transform: interactive && pressed && !disabled
      ? 'scale(0.99)'
      : interactive && hovered && !disabled
      ? 'translateY(-2px)'
      : 'translateY(0)',
    boxShadow: interactive && hovered && !disabled ? 'var(--shadow-raise)' : 'none',
    transition: `transform var(--motion-duration-medium) var(--motion-ease-out-quart), box-shadow var(--motion-duration-medium) var(--motion-ease-out-quart)`,
    opacity: disabled ? 0.4 : 1,
    outline: 'none',
  };

  const inner = (
    <>
      {header && (
        <>
          {header}
          <div style={{ height: 1, background: 'var(--color-hairline)', margin: 0 }} />
        </>
      )}
      {children}
      {footer && (
        <>
          <div style={{ height: 1, background: 'var(--color-hairline)', margin: 0 }} />
          {footer}
        </>
      )}
    </>
  );

  if (interactive) {
    return (
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-pressed={selected}
        aria-disabled={disabled}
        style={style}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onClick={() => { if (!disabled) onPress?.(); }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            onPress?.();
          }
        }}
      >
        {inner}
      </div>
    );
  }

  return <div style={style}>{inner}</div>;
}
