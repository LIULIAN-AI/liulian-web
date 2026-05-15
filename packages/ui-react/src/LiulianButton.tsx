import { useState, type CSSProperties, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface LiulianButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  onPress?: () => void;
  children: ReactNode;
}

const HEIGHT: Record<ButtonSize, string> = {
  sm: 'var(--control-height-sm)',
  md: 'var(--control-height-md)',
  lg: 'var(--control-height-lg)',
};
const PADDING_X: Record<ButtonSize, string> = {
  sm: 'var(--control-paddingx-sm)',
  md: 'var(--control-paddingx-md)',
  lg: 'var(--control-paddingx-lg)',
};
const FONT_SIZE: Record<ButtonSize, string> = {
  sm: 'var(--fontsize-sm)',
  md: 'var(--fontsize-md)',
  lg: 'var(--fontsize-lg)',
};

function backgroundFor(variant: ButtonVariant, hovered: boolean): string {
  if (hovered) {
    switch (variant) {
      case 'primary': return 'var(--color-unibe-red-deep)';
      case 'secondary': return 'var(--color-canvas-warm)';
      case 'ghost': return 'var(--color-canvas-warm)';
      case 'danger': return 'var(--color-unibe-red-deep)';
    }
  }
  switch (variant) {
    case 'primary': return 'var(--color-unibe-red)';
    case 'secondary': return 'var(--color-surface-pure)';
    case 'ghost': return 'transparent';
    case 'danger': return 'var(--color-unibe-red-deep)';
  }
}

function foregroundFor(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
    case 'danger':
      return 'var(--color-surface-pure)';
    case 'secondary':
      return 'var(--color-ink-charcoal)';
    case 'ghost':
      return 'var(--color-ink-muted)';
  }
}

export function LiulianButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  ariaLabel,
  onPress,
  children,
}: LiulianButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const bg = backgroundFor(variant, hovered && !disabled && !loading);
  const fg = foregroundFor(variant);

  const style: CSSProperties = {
    height: HEIGHT[size],
    padding: `0 ${PADDING_X[size]}`,
    backgroundColor: bg,
    color: fg,
    border: variant === 'secondary' ? '1px solid var(--color-hairline)' : 'none',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    fontSize: FONT_SIZE[size],
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transform: pressed && !disabled ? 'scale(0.98)' : (hovered && !disabled ? 'translateY(-1px)' : 'translateY(0)'),
    transition: `background-color var(--motion-duration-fast) var(--motion-ease-out-quart), transform var(--motion-duration-instant) var(--motion-ease-out)`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--control-icongap)',
    outline: 'none',
    minHeight: 'var(--touch-mintarget-ios)',
  };

  return (
    <button
      type="button"
      style={style}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={() => { if (!disabled && !loading) onPress?.(); }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `var(--focus-ringwidth) solid var(--color-unibe-red)`;
        e.currentTarget.style.outlineOffset = `var(--focus-ringoffset)`;
      }}
      onBlur={(e) => { e.currentTarget.style.outline = 'none'; }}
      disabled={disabled || loading}
    >
      {loading ? (
        <span
          aria-hidden
          style={{
            width: 'var(--control-iconsize-md)',
            height: 'var(--control-iconsize-md)',
            border: `2px solid ${fg}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'liulian-spin 600ms linear infinite',
          }}
        />
      ) : children}
    </button>
  );
}

// Inject keyframes once on module load (idempotent).
if (typeof document !== 'undefined' && !document.getElementById('liulian-keyframes')) {
  const style = document.createElement('style');
  style.id = 'liulian-keyframes';
  style.textContent = '@keyframes liulian-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}
