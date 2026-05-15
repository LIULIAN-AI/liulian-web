import type { CSSProperties, ReactNode } from 'react';

export type TextVariant =
  | 'display'
  | 'displayShort'
  | 'heading'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'monoLabel';

export interface LiulianTextProps {
  variant?: TextVariant;
  color?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  align?: 'left' | 'center' | 'right';
  className?: string;
  children: ReactNode;
}

const VARIANT_STYLES: Record<TextVariant, CSSProperties> = {
  display: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--fontsize-6xl)',
    fontWeight: 500,
    lineHeight: 0.95,
    letterSpacing: '-0.04em',
  },
  displayShort: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--fontsize-5xl)',
    fontWeight: 500,
    lineHeight: 0.98,
    letterSpacing: '-0.035em',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--fontsize-4xl)',
    fontWeight: 500,
    lineHeight: 1.05,
    letterSpacing: '-0.025em',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--fontsize-3xl)',
    fontWeight: 500,
    lineHeight: 1.12,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--fontsize-xl)',
    fontWeight: 500,
    lineHeight: 1.35,
    letterSpacing: '-0.01em',
  },
  body: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--fontsize-md)',
    fontWeight: 400,
    lineHeight: 1.55,
  },
  bodyStrong: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--fontsize-md)',
    fontWeight: 500,
    lineHeight: 1.55,
  },
  caption: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--fontsize-xs)',
    fontWeight: 400,
    lineHeight: 1.45,
  },
  monoLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--fontsize-xs)',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.10em',
    textTransform: 'uppercase' as const,
  },
};

const VARIANT_DEFAULT_TAG: Record<TextVariant, LiulianTextProps['as']> = {
  display: 'h1',
  displayShort: 'h1',
  heading: 'h2',
  title: 'h3',
  subtitle: 'p',
  body: 'p',
  bodyStrong: 'p',
  caption: 'p',
  monoLabel: 'span',
};

export function LiulianText({
  variant = 'body',
  color = 'var(--color-ink-charcoal)',
  as,
  align = 'left',
  className,
  children,
}: LiulianTextProps) {
  const Tag = (as ?? VARIANT_DEFAULT_TAG[variant]) ?? 'p';
  const style: CSSProperties = {
    ...VARIANT_STYLES[variant],
    color,
    textAlign: align,
    margin: 0,
  };

  const Component = Tag as keyof JSX.IntrinsicElements;
  return <Component style={style} className={className}>{children}</Component>;
}
