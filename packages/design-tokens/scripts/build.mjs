#!/usr/bin/env node
/**
 * LIULIAN design-tokens build script.
 * Reads src/tokens.json and emits:
 *   dist/tokens.css            (CSS custom properties)
 *   dist/tokens.mjs            (ESM)
 *   dist/tokens.js             (CJS)
 *   dist/tokens.d.ts           (TS types)
 *   dist/tokens.rn.js          (React Native StyleSheet object)
 *   dist/tailwind.preset.js    (Tailwind preset)
 *   dist/antd-theme.js         (Ant Design ConfigProvider theme)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
mkdirSync(DIST, { recursive: true });

const tokens = JSON.parse(readFileSync(join(ROOT, 'src/tokens.json'), 'utf8'));

// Walk tokens, collecting leaf {path, value} pairs.
function walk(obj, prefix = []) {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue;
    const path = [...prefix, k];
    if (v && typeof v === 'object' && 'value' in v) {
      out.push({ path, value: v.value, description: v.$description });
    } else if (v && typeof v === 'object') {
      out.push(...walk(v, path));
    }
  }
  return out;
}
const leaves = walk(tokens);

// Helper to make a CSS-safe variable name from a path array.
const cssVar = (path) =>
  '--' + path.join('-').replace(/DEFAULT$/, '').replace(/-$/, '').toLowerCase();

// ---- tokens.css ----
const cssLines = [
  '/* AUTO-GENERATED from src/tokens.json by scripts/build.mjs — DO NOT EDIT. */',
  ':root {',
];
for (const { path, value, description } of leaves) {
  const v = Array.isArray(value) ? value.join(', ') : value;
  if (description) cssLines.push(`  /* ${description} */`);
  cssLines.push(`  ${cssVar(path)}: ${v};`);
}
cssLines.push('}');
writeFileSync(join(DIST, 'tokens.css'), cssLines.join('\n') + '\n');

// ---- tokens.mjs / .js ----
const flat = Object.fromEntries(
  leaves.map(({ path, value }) => [path.join('.'), value])
);
const esm = `/* AUTO-GENERATED */
export const tokens = ${JSON.stringify(flat, null, 2)};
export default tokens;
`;
writeFileSync(join(DIST, 'tokens.mjs'), esm);
writeFileSync(
  join(DIST, 'tokens.js'),
  '/* AUTO-GENERATED */\n' +
    `const tokens = ${JSON.stringify(flat, null, 2)};\n` +
    'module.exports = tokens;\nmodule.exports.tokens = tokens;\n'
);

// ---- tokens.d.ts ----
const dts =
  '/* AUTO-GENERATED */\n' +
  `export declare const tokens: ${JSON.stringify(
    Object.fromEntries(Object.keys(flat).map((k) => [k, 'string'])),
    null,
    2
  ).replace(/"string"/g, 'string')};\nexport default tokens;\n`;
writeFileSync(join(DIST, 'tokens.d.ts'), dts);

// ---- tokens.rn.js (React Native StyleSheet object) ----
const rn = `/* AUTO-GENERATED React Native style tokens. */
export const colors = {
${leaves
  .filter(({ path }) => path[0] === 'color')
  .map(({ path, value }) => `  ${path.slice(1).join('_').replace(/-/g, '_')}: ${JSON.stringify(value)},`)
  .join('\n')}
};
export const fonts = {
${leaves
  .filter(({ path }) => path[0] === 'font')
  .map(({ path, value }) => `  ${path[1]}: ${JSON.stringify(Array.isArray(value) ? value : [value])},`)
  .join('\n')}
};
export const spacing = ${JSON.stringify(
  Object.fromEntries(
    leaves.filter(({ path }) => path[0] === 'spacing').map(({ path, value }) => [path[1], value])
  ),
  null,
  2
)};
export const radius = ${JSON.stringify(
  Object.fromEntries(
    leaves.filter(({ path }) => path[0] === 'radius').map(({ path, value }) => [path[1], value])
  ),
  null,
  2
)};
export default { colors, fonts, spacing, radius };
`;
writeFileSync(join(DIST, 'tokens.rn.js'), rn);

// ---- tailwind.preset.js ----
const tailwindColors = {};
for (const { path, value } of leaves.filter(({ path }) => path[0] === 'color')) {
  const ns = path[1];
  const variant = path.slice(2).join('-') || 'DEFAULT';
  tailwindColors[ns] = tailwindColors[ns] || {};
  tailwindColors[ns][variant.toLowerCase()] = value;
}
const preset = `/* AUTO-GENERATED Tailwind preset. */
module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(tailwindColors, null, 2)},
      fontFamily: ${JSON.stringify(
        Object.fromEntries(
          leaves.filter(({ path }) => path[0] === 'font').map(({ path, value }) => [path[1], value])
        ),
        null,
        2
      )},
      fontSize: ${JSON.stringify(
        Object.fromEntries(
          leaves.filter(({ path }) => path[0] === 'fontSize').map(({ path, value }) => [path[1], value])
        ),
        null,
        2
      )},
      spacing: ${JSON.stringify(
        Object.fromEntries(
          leaves.filter(({ path }) => path[0] === 'spacing').map(({ path, value }) => [path[1], value])
        ),
        null,
        2
      )},
      borderRadius: ${JSON.stringify(
        Object.fromEntries(
          leaves.filter(({ path }) => path[0] === 'radius').map(({ path, value }) => [path[1], value])
        ),
        null,
        2
      )},
    },
  },
};
`;
writeFileSync(join(DIST, 'tailwind.preset.js'), preset);

// ---- antd-theme.js ----
const getC = (p) => leaves.find(({ path }) => path.join('.') === p)?.value;
const antd = `/* AUTO-GENERATED Ant Design ConfigProvider theme. */
module.exports = {
  token: {
    colorPrimary: ${JSON.stringify(getC('color.unibe-red.DEFAULT'))},
    colorBgBase: ${JSON.stringify(getC('color.canvas.warm'))},
    colorBgContainer: ${JSON.stringify(getC('color.surface.pure'))},
    colorTextBase: ${JSON.stringify(getC('color.ink.charcoal'))},
    colorTextSecondary: ${JSON.stringify(getC('color.ink.muted'))},
    colorBorder: ${JSON.stringify(getC('color.hairline.DEFAULT'))},
    colorBorderSecondary: ${JSON.stringify(getC('color.hairline.strong'))},
    fontFamily: ${JSON.stringify((getC('font.body') || []).join(', '))},
    fontFamilyCode: ${JSON.stringify((getC('font.mono') || []).join(', '))},
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,
    wireframe: false,
  },
  components: {
    Button: { borderRadius: 6, fontWeight: 500 },
    Card: { borderRadiusLG: 10, paddingLG: 24 },
    Input: { borderRadius: 6 },
    Select: { borderRadius: 6 },
    Table: { borderRadiusLG: 0, headerBg: ${JSON.stringify(getC('color.surface.shade'))} },
  },
};
`;
writeFileSync(join(DIST, 'antd-theme.js'), antd);

console.log(
  `✓ wrote ${leaves.length} tokens to dist/ — ${[
    'tokens.css',
    'tokens.mjs / .js / .d.ts',
    'tokens.rn.js',
    'tailwind.preset.js',
    'antd-theme.js',
  ].join(', ')}`
);
