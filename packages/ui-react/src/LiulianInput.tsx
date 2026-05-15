import { useState, type CSSProperties } from 'react';

export type InputVariant = 'text' | 'password' | 'search' | 'number' | 'textarea';
export type InputSize = 'sm' | 'md';

export interface LiulianInputProps {
  value: string;
  onChange: (value: string) => void;
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  placeholder?: string;
  helpText?: string;
  errorText?: string;
  disabled?: boolean;
  readonly?: boolean;
  ariaLabel?: string;
}

export function LiulianInput({
  value,
  onChange,
  variant = 'text',
  size = 'md',
  label,
  placeholder,
  helpText,
  errorText,
  disabled = false,
  readonly = false,
  ariaLabel,
}: LiulianInputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!errorText;

  const borderColor = hasError
    ? 'var(--color-unibe-red-text)'
    : focused
    ? 'var(--color-unibe-red)'
    : 'var(--color-hairline)';
  const bg = disabled || readonly ? 'var(--color-surface-shade)' : 'var(--color-surface-pure)';
  const height =
    variant === 'textarea'
      ? '80px'
      : size === 'sm'
      ? 'var(--control-height-sm)'
      : 'var(--control-height-md)';

  const fieldStyle: CSSProperties = {
    width: '100%',
    height: variant === 'textarea' ? undefined : height,
    minHeight: variant === 'textarea' ? height : undefined,
    padding: variant === 'textarea' ? '8px 12px' : '0 12px',
    background: bg,
    color: 'var(--color-ink-charcoal)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--fontsize-md)',
    border: `1px solid ${borderColor}`,
    borderRadius: 'var(--radius-sm)',
    outline: 'none',
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    caretColor: 'var(--color-unibe-red)',
    boxSizing: 'border-box',
    resize: variant === 'textarea' ? 'vertical' : undefined,
    fontWeight: 400,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <label style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fontsize-md)',
          fontWeight: 500,
          color: 'var(--color-ink-charcoal)',
        }}>{label}</label>
      )}
      {variant === 'textarea' ? (
        <textarea
          style={fieldStyle}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          aria-label={ariaLabel ?? label}
          aria-invalid={hasError}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          style={fieldStyle}
          type={
            variant === 'password' ? 'password' :
            variant === 'number' ? 'number' :
            variant === 'search' ? 'search' :
            'text'
          }
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          aria-label={ariaLabel ?? label}
          aria-invalid={hasError}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hasError ? (
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fontsize-xs)',
          color: 'var(--color-unibe-red-text)',
        }}>{errorText}</span>
      ) : helpText ? (
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fontsize-xs)',
          color: 'var(--color-ink-muted)',
        }}>{helpText}</span>
      ) : null}
    </div>
  );
}
