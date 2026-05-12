/**
 * Slash & command-palette registry.
 *
 * Each command runs against a `CommandContext` provided by the chat
 * panel — so handlers can call sendMessage, mutate panel state, change
 * sessions, etc. without coupling to the React tree.
 */

export type CommandCategory = 'general' | 'banking';

export interface CommandContext {
  sendMessage: (text: string) => void;
  setInputValue: (text: string) => void;
  startNewChat: () => void;
  renameSession: (title: string) => void;
  togglePinCurrent: () => void;
  setPanelExpanded: (expanded: boolean) => void;
  copyTranscript: () => void;
  exportTranscript: () => void;
}

export interface CommandDef {
  /** Slash key — e.g. "summary" → typed as "/summary". */
  key: string;
  category: CommandCategory;
  /** Short label rendered in the menu. */
  label: string;
  /** One-line description / what it does. */
  description: string;
  /** Optional keyboard shortcut for the command palette display. */
  shortcut?: string;
  /** Pinyin / Cantonese / Chinese aliases for fuzzy matching. */
  aliases?: string[];
  /** Implementation. May be invoked with args after the key. */
  run: (ctx: CommandContext, args?: string) => void;
}

export const COMMANDS: CommandDef[] = [
  // ── General ─────────────────────────────────────────────
  {
    key: 'summary',
    category: 'general',
    label: '/summary',
    description: 'Summarize the current conversation',
    aliases: ['zongjie', 'zungit', '总结', '總結'],
    run: (ctx) => ctx.sendMessage('Summarize our conversation so far with key topics and decisions.'),
  },
  {
    key: 'rename',
    category: 'general',
    label: '/rename',
    description: 'Rename this conversation',
    aliases: ['chongmingming', 'cungmingming', '重命名', '重新命名'],
    run: (ctx, args) => {
      const next = args?.trim();
      if (next) ctx.renameSession(next);
      else ctx.setInputValue('/rename ');
    },
  },
  {
    key: 'clear',
    category: 'general',
    label: '/clear',
    description: 'Start a fresh chat (current is archived)',
    aliases: ['qingkong', 'cinglung', '清空', '新对话', '新對話'],
    run: (ctx) => ctx.startNewChat(),
  },
  {
    key: 'pin',
    category: 'general',
    label: '/pin',
    description: 'Pin or unpin this session',
    aliases: ['zhiding', 'ziding', '置顶', '置頂'],
    run: (ctx) => ctx.togglePinCurrent(),
  },
  {
    key: 'expand',
    category: 'general',
    label: '/expand',
    description: 'Expand the chat panel to full screen',
    aliases: ['zhankai', 'zinhoi', '展开', '展開', '全屏'],
    run: (ctx) => ctx.setPanelExpanded(true),
  },
  {
    key: 'collapse',
    category: 'general',
    label: '/collapse',
    description: 'Collapse the chat panel back to default',
    aliases: ['shouqi', 'sauhei', '收起', '收起'],
    run: (ctx) => ctx.setPanelExpanded(false),
  },
  {
    key: 'copy',
    category: 'general',
    label: '/copy',
    description: 'Copy the full transcript to clipboard',
    aliases: ['fuzhi', 'fukjai', '复制', '複製'],
    run: (ctx) => ctx.copyTranscript(),
  },
  {
    key: 'export',
    category: 'general',
    label: '/export',
    description: 'Export the transcript as Markdown',
    aliases: ['daochu', 'douceot', '导出', '匯出'],
    run: (ctx) => ctx.exportTranscript(),
  },

  // ── Neobanker-specific ─────────────────────────────────
  {
    key: 'compare',
    category: 'banking',
    label: '/compare',
    description: 'Compare two banks side-by-side',
    aliases: ['duibi', 'deuibei', '对比', '對比', '比较', '比較'],
    run: (ctx, args) => {
      const text = args?.trim()
        ? `Compare ${args.trim()} side-by-side across products, fees, regulators and reliability.`
        : 'Compare these banks side-by-side: ';
      args?.trim() ? ctx.sendMessage(text) : ctx.setInputValue(text);
    },
  },
  {
    key: 'find',
    category: 'banking',
    label: '/find',
    description: 'Find banks/products matching criteria',
    aliases: ['chazhao', 'caazaau', '查找', '搜索', '搜尋'],
    run: (ctx, args) => {
      args?.trim()
        ? ctx.sendMessage(`Find banks/products matching: ${args.trim()}`)
        : ctx.setInputValue('/find ');
    },
  },
  {
    key: 'attach',
    category: 'banking',
    label: '/attach',
    description: 'Attach the current page card as context',
    aliases: ['fujia', 'fuga', '附加', '附加上下文'],
    run: (ctx) => ctx.setInputValue('/attach — click a card on the page to attach context.'),
  },
  {
    key: 'persona',
    category: 'banking',
    label: '/persona',
    description: 'Switch advisor persona (retail / enterprise / compliance)',
    aliases: ['juese', 'goeksik', '角色', '顾问', '顧問'],
    run: (ctx, args) => {
      const next = args?.trim().toLowerCase();
      ctx.sendMessage(`Switch advisor persona to ${next || 'retail'} for the rest of this chat.`);
    },
  },
  {
    key: 'region',
    category: 'banking',
    label: '/region',
    description: 'Set your region (e.g. HK, SG, US)',
    aliases: ['diqu', 'deikui', '地区', '地區'],
    run: (ctx, args) =>
      ctx.sendMessage(`Set my region to ${args?.trim() || 'HK'} for region-aware answers.`),
  },
  {
    key: 'tier',
    category: 'banking',
    label: '/tier',
    description: 'Set platform tier (retail or enterprise)',
    aliases: ['cengji', 'canggap', '层级', '層級'],
    run: (ctx, args) =>
      ctx.sendMessage(`Operate at ${args?.trim() || 'retail'} platform tier for this session.`),
  },
  {
    key: 'source',
    category: 'banking',
    label: '/source',
    description: 'Show sources for the most recent answer',
    aliases: ['laiyuan', 'loijyun', '来源', '來源'],
    run: (ctx) => ctx.sendMessage('List the sources used for your last answer with provider tiers.'),
  },
  {
    key: 'audit',
    category: 'banking',
    label: '/audit',
    description: 'Print the audit trail for this conversation',
    aliases: ['shenji', 'samgai', '审计', '審計'],
    run: (ctx) =>
      ctx.sendMessage('Show me the audit trail (interaction path) for this conversation.'),
  },
  {
    key: 'explain',
    category: 'banking',
    label: '/explain',
    description: 'Explain the reasoning behind the last answer',
    aliases: ['jieshi', 'gaaisik', '解释', '解釋'],
    run: (ctx) =>
      ctx.sendMessage('Explain the reasoning and verification steps behind your last answer.'),
  },
  {
    key: 'idp',
    category: 'banking',
    label: '/idp',
    description: 'Explain the Identity & Document Process (IDP)',
    aliases: ['shenfen', 'sanfan', '身份验证', '身份驗證'],
    run: (ctx) =>
      ctx.sendMessage('Explain the Identity & Document Process (IDP) in plain language.'),
  },
];

/** Normalize Chinese slash variants (、／) to ASCII `/`. */
export function normalizeSlashPrefix(input: string): string {
  if (input.startsWith('、') || input.startsWith('／')) {
    return '/' + input.slice(1);
  }
  return input;
}

/** Match commands whose key prefix-matches `query` (case-insensitive).
 *  Also matches against pinyin / Cantonese / Chinese aliases. */
export function matchSlashCommands(query: string): CommandDef[] {
  const q = query.toLowerCase();
  if (!q) return COMMANDS;
  return COMMANDS.filter(
    (c) =>
      c.key.startsWith(q) ||
      c.label.toLowerCase().includes(q) ||
      c.aliases?.some((a) => a.startsWith(q) || a.includes(q)),
  );
}

/** Fuzzy match for the command palette — looks at key + description + aliases. */
export function matchPaletteCommands(query: string): CommandDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return COMMANDS;
  return COMMANDS.filter((c) => {
    const aliasStr = c.aliases?.join(' ') ?? '';
    const haystack = `${c.key} ${c.label} ${c.description} ${aliasStr}`.toLowerCase();
    return q.split(/\s+/).every((token) => haystack.includes(token));
  });
}

/** Parse user input — if it starts with `/` (or `、`/`／`), return the command + args. */
export function parseSlashInput(input: string): { key: string; args: string } | null {
  const normalized = normalizeSlashPrefix(input.trim());
  const match = /^\/(\w[\w-]*)(?:\s+(.*))?$/.exec(normalized);
  if (!match) return null;
  return { key: match[1].toLowerCase(), args: match[2] ?? '' };
}
