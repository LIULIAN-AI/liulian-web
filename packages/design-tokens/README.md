# @liulian/design-tokens

> **Language:** English | [中文](README.zh.md) *(stub pending)*

LIULIAN's canonical design tokens. Single source of truth in
`src/tokens.json`; build script emits per-platform consumables.

## Brand at a glance

- **Anchor color**: UniBe red `#E20613` (used rarely; max 2 visible per
  viewport on most pages)
- **Canvas**: warm bone `#FBFBFA` (never `#fff`)
- **Ink**: charcoal `#131313` (never `#000`)
- **Display**: Fraunces (variable, op-size 9..144, WONK 0..1)
- **Body**: Switzer (Fontshare)
- **Mono**: JetBrains Mono (tabular numerals throughout)

See `liulian-python/docs/strategy/PLATFORM_DESIGN.md §2` for the full
spec and the rationale.

## Source canon

Tokens were extracted from `liulian-python/.worktrees/gui-demo/styles/main.css`,
iteration 2 (UniBe red on warm paper). The `gui-demo`'s
`docs/design-report.md` is the brand bible.

## Install

```bash
pnpm add @liulian/design-tokens
```

Or in a monorepo:

```jsonc
// package.json
"dependencies": {
  "@liulian/design-tokens": "workspace:*"
}
```

## Consume

### Tailwind preset

```js
// tailwind.config.ts
import liulianPreset from '@liulian/design-tokens/tailwind';
export default {
  presets: [liulianPreset],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
};
```

### CSS variables

```css
@import '@liulian/design-tokens/css';

/* now in your stylesheets: */
.button-primary {
  background: var(--color-unibe-red);
  color: var(--color-canvas-warm);
  border-radius: var(--radius-sm);
}
```

### TypeScript const

```ts
import { tokens } from '@liulian/design-tokens';

console.log(tokens['color.unibe-red']);  // "#E20613"
```

### Ant Design theme

```tsx
import antdTheme from '@liulian/design-tokens/antd-theme';
import { ConfigProvider } from 'antd';

<ConfigProvider theme={antdTheme}>
  <App />
</ConfigProvider>
```

### React Native StyleSheet

```tsx
import { colors, fonts, spacing } from '@liulian/design-tokens/rn';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface_pure,
    padding: parseInt(spacing['6']),
    borderRadius: parseInt(radius.md),
  },
});
```

## Build

```bash
pnpm install
pnpm run build
```

## Versioning

Major version bumps for breaking token changes (rename, remove, semantic
re-color). Minor for additions. Patch for fixes that don't change values.

## License

MIT.
