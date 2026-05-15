import { useRef, useLayoutEffect, useState, type CSSProperties } from 'react';

export interface LiulianTabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export type TabVariant = 'default' | 'compact';

export interface LiulianTabProps {
  items: LiulianTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: TabVariant;
}

export function LiulianTab({ items, activeId, onChange, variant = 'default' }: LiulianTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ x: number; w: number }>({ x: 0, w: 0 });

  useLayoutEffect(() => {
    const el = itemRefs.current.get(activeId);
    const container = containerRef.current;
    if (!el || !container) return;
    const cr = container.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    setIndicator({ x: er.left - cr.left, w: er.width });
  }, [activeId, items]);

  const height = variant === 'compact' ? 'var(--control-height-sm)' : 'var(--control-height-md)';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        height,
        background: 'var(--color-canvas-warm)',
        borderBottom: '1px solid var(--color-hairline)',
        boxSizing: 'border-box',
      }}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        const style: CSSProperties = {
          height,
          padding: '0 var(--spacing-4)',
          background: 'transparent',
          border: 'none',
          cursor: item.disabled ? 'not-allowed' : 'pointer',
          opacity: item.disabled ? 0.4 : 1,
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fontsize-xs)',
          fontWeight: active ? 500 : 400,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: active ? 'var(--color-ink-charcoal)' : 'var(--color-ink-muted)',
        };
        return (
          <button
            key={item.id}
            ref={(el) => { if (el) itemRefs.current.set(item.id, el); }}
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            style={style}
            onClick={() => { if (!item.disabled) onChange(item.id); }}
          >
            {item.label}
          </button>
        );
      })}
      {/* Active indicator */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          bottom: -1,
          transform: `translateX(${indicator.x}px)`,
          width: indicator.w,
          height: 2,
          background: 'var(--color-unibe-red)',
          transition: 'transform var(--motion-duration-fast) var(--motion-ease-out-quart), width var(--motion-duration-fast) var(--motion-ease-out-quart)',
        }}
      />
    </div>
  );
}
