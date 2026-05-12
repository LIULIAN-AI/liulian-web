# Developer Update Log (Frontend)

> Rolling single-file log: grouped by date; multiple updates on the same day use `v1 / v2 / v3`.

## 2026-04-26

### v1 `[NEW]` WF-B6 Data Export to Report — Full Implementation + AI Enhanced Path

#### Background

Implements WF-B6 from design spec `docs/superpowers/specs/2026-04-25-platform-comprehensive-redesign.md`. Full traditional path (5 steps) + AI enhanced path (3 steps). Professional report template with rich mock data, inline SVG charts, multi-bank comparison tables.

#### Changes

- `[NEW/REWRITE]` `components/assistant/ReportBuilder.tsx` (~430 lines) — Two-panel report builder with 8 section types, inline SVG chart generators, self-contained HTML report output, §N§ placeholder numbering, iframe live preview, HTML/PDF export
- `[CHANGED]` `components/assistant/CanvasOrchestrator.tsx` — 3 new detection functions (detectReportRequest / detectReportTitleChange / detectExportCommand) for AI chat-driven report operations via CustomEvent
- `[CHANGED]` `components/assistant/DynamicCanvas.tsx` — `openReportBuilder` CustomEvent listener with AI parameters (title / autoSelect)
- `[CHANGED]` `components/assistant/assistant.module.css` — ~150 lines added (split layout / section rows / preview panel / drag handles / note inputs)

#### Mock Status

All data is mock (4 virtual banks from `data/mockBanks.ts`). Future: replace `getMockBank()` with backend API calls.

#### §4 Advanced Interaction Design Mapping

| Design | WF-B6 Implementation | Status |
|---|---|---|
| §4.1 Smart Switcher | `mapWidgetTypesToSections()` auto-maps Canvas widgets to report sections | ✅ Implemented |
| §4.2 Platform Embedding | iframe-based live report preview | ✅ Implemented |
| §4.3 Chat Embedded Widgets | `report-preview` type registered in registry (full preview card not yet) | ⚠️ Partial |
| §4.4 Inline Chat Workflow | All 3 AI path steps via Chat → CanvasOrchestrator → CustomEvent → ReportBuilder | ✅ Core implementation |

#### Verification

Traditional path (5 steps) + AI path Step 1 verified via Chrome MCP browser testing.

---

### v2 `[NEW]` 4 Interaction Fixes — Widget Maximize/Minimize, 3-State Layout, InlineBIWidget Chart Switching, Open in Canvas

#### Background

Fixes 4 interaction bugs on the AI Assistant page: non-functional maximize buttons, missing layout collapse controls, limited InlineBIWidget interactivity, and broken "Open in Canvas" button.

#### Changes

- `[CHANGED]` `components/assistant/types.ts` — Added `maximizedWidgetId: string | null` to CanvasState + MAXIMIZE_WIDGET / RESTORE_WIDGET actions
- `[CHANGED]` `contexts/CanvasContext.tsx` — Maximize/restore reducer cases + collapse guard logic (prevents both panels from being collapsed simultaneously)
- `[CHANGED]` `components/assistant/DynamicCanvas.tsx` — Wired maximize toggle, conditional full-canvas rendering for maximized widget with Restore button
- `[CHANGED]` `components/assistant/widgets/WidgetShell.tsx` — Maximize button toggles icon between Maximize2/Minimize2
- `[CHANGED]` `app/(assistant)/assistant/page.tsx` — Canvas panel header with collapse button, collapsed bar with restore buttons, chatPanelFull class for full-width chat-only mode
- `[CHANGED]` `components/chat/InlineBIWidget.tsx` — localChartType state + chart type toolbar (Bar/Line/Area/Radar), canvas auto-uncollapse on "Open in Canvas"
- `[CHANGED]` `assistant.module.css` — canvasMaximized, collapsedBar, chatPanelFull styles
- `[CHANGED]` `chat.module.css` — inlineBIChartToolbar, inlineBIChartTypeBtn styles

#### Verification

| Fix | Method | Result |
|---|---|---|
| Bug 1 — Widget maximize/restore | Playwright MCP | ✅ Maximize fills canvas, Restore returns to grid |
| Bug 2 — 3-state layout + guard | Playwright MCP | ✅ Canvas-only, chat-only (full width), guard prevents both-collapsed |
| Bug 3 — Chart type switching | Code review (demo backend lacks chart blocks) | ✅ Code correct |
| Bug 4 — Open in Canvas | Code review (requires InlineBIWidget) | ✅ Code correct |

---

## 2026-04-17

### v10 `[NEW]` Chatbot 14-point modernization — animation speed-up / multi-lang TTS / voice fix / modern layout / prompt history / cross-page reveal / responsive / design tokens

#### Background
After v9 shipped, the customer raised 14 issues. Headline pain points:
1. **Animations feel sluggish** — panel expand/collapse, button hovers, tip-fly into composer.
2. **TTS English-only** — Chinese / Cantonese / mixed answers all read with an English voice.
3. **Voice input button flashes and dies** — recognition object rebuilt every render.
4. **Header persona text** — the literal word "female" is unprofessional in a finance UI.
5. **Inconsistent button styling** — input toolbar vs assistant toolbar look and sit differently.
6. **Context card "jump back" broken** — leaves user stranded after navigating away.
7. **Slash menu / input history** — no keyboard up/down navigation.
8. **"Performing deep thinking"** — pops for every answer, even fast ones; never disappears.
9. **Revert dashed-line click does nothing** — only hover-arms.
10. **Responsive gaps** — panel sizes go off-screen on phones / sprawl on ultra-wide.
11. **Color drift** — accent / success / danger hard-coded in many places.

This pass closes all of them, plus introduces a design-token layer and a full responsive tier.

#### Changes (numbered against the 14 fixes)

##### v10-1 `[NEW]` Faster animation system
- `[CHANGED]` `components/chat/motion.ts`: `springSnappy` stiffness 420→520, mass 0.9→0.7; `springSilky` 240→320; `panelSlide` switched from spring to a 0.18s tween; bubble entrance loses scale, just 8px y / 10px x.
- `[CHANGED]` `components/chat/ChatPanel.tsx`: **removed** `layout: true` on the panel motion.div — root cause of the v9 "everything feels slow" complaint. Every state change re-tweened the entire panel.
- `[CHANGED]` `components/chat/chat.module.css`: `.panel` now owns the default↔expanded morph via 0.22s iOS-eased CSS transition on width/height/inset; framer-motion only handles fade+scale.

##### v10-2 `[CHANGED]` Persona badge removed from header
- `[CHANGED]` `components/chat/ChatPanel.tsx`: dropped `<span className={styles.personaBadge}><ThunderboltOutlined/> {persona}</span>`. The header no longer surfaces "female / male" copy.

##### v10-3 `[CHANGED]` Slower chip-fly with arc trail
- `[CHANGED]` `components/chat/ChipFlyOverlay.tsx`: ~280ms spring → 620ms tween; introduced `arcLift = clamp(travel × 0.12, 18, 46)` so chips fly along an arc; keyframe arrays drive top/scale/opacity together.

##### v10-4 `[NEW]` Multi-language TTS with auto voice selection
- `[NEW]` `components/chat/tts-lang.ts`: pure-JS BCP-47 detection (CJK→zh-CN, traditional bias→zh-HK, kana→ja-JP, Hangul→ko-KR, Cyrillic→ru-RU; Arabic / Devanagari / Thai / Hebrew / Greek / Latin all covered) + `splitForTts()` to chunk on script transitions + `pickVoiceForLang()` exact→prefix→Cantonese fallback.
- `[CHANGED]` `components/chat/AssistantFeedback.tsx`: `useEffect` listens for the async `voiceschanged` event; `handleReadAloud()` chunks the message, picks a voice per chunk, enqueues utterances; only the last utterance's `onend` resets `isSpeaking`.

##### v10-5 `[CHANGED]` Voice-input button stabilised
- `[CHANGED]` `components/chat/hooks/useVoiceInput.ts`: previous `useEffect` had `onTranscript` in its dependency array → recognition aborted/rebuilt every render ("flashes and dies" root cause). Switched to a callback-ref pattern; effect now depends only on `lang`. Added `onError(reason, raw)` callback distinguishing `not-allowed / no-speech / audio-capture / network / aborted / unsupported / unknown`.
- `[CHANGED]` `components/chat/ChatInput.tsx`: surfaces errors via antd `message.warning` (suppresses `aborted`).

##### v10-6 `[CHANGED]` Unified input vs assistant button styling
- `[CHANGED]` `chat.module.css`: shared rule normalises `.assistantActionBtn / .voiceBtn / .sendBtn / .stopBtn` to 30px circles with `var(--nbk-line-strong)` border and matching accent on hover; user toolbar moved from "left of bubble" to "below bubble" (`messageRowUserStack`, flex-direction: column).
- `[CHANGED]` `components/chat/MessageBubble.tsx`: user-row DOM order swapped (bubble first, actions second); added `messageRowUserStack` className.

##### v10-7 `[NEW]` Context card jumps back to source page
- `[CHANGED]` `components/chat/types.ts`: `ContextMessage.sourcePath?` and `INJECT_CONTEXT.sourcePath?` persisted; `injectContext(component, data, sourceId, sourcePath)` signature widened.
- `[CHANGED]` `contexts/ChatContext.tsx`: reducer writes `sourcePath` onto the message.
- `[CHANGED]` `components/chat/InjectContextButton.tsx`: click / drag captures `window.location.pathname + search`; `sourceId` switched from random UUID to a **deterministic hash of `component + data identifier fields`** so the same logical card on a re-visited page still matches.
- `[CHANGED]` `components/chat/ContextCard.tsx`: reveal button tries the current page first; on miss, calls `router.push(sourcePath)` and polls via `requestAnimationFrame` for up to 1.5s waiting for the new page to mount, then highlights; loading toast via `antdMessage`.

##### v10-8 `[VERIFIED]` Slash command up/down keyboard nav
- Already wired: `ChatInput.tsx` handles ArrowUp/ArrowDown when `slashOpen && matches.length>0`, advancing `slashIndex`; `SlashAutocomplete.tsx` is a controlled component on `activeIndex`. Re-verified during v10-9 work.

##### v10-9 `[NEW]` Prompt history recall via ↑/↓
- `[CHANGED]` `components/chat/ChatInput.tsx`: new `history?: string[]` prop (most recent last); ArrowUp walks back, ArrowDown walks forward, Esc exits (only when slash menu is closed); `historyIdxRef` cursor + `draftRef` to stash the current draft; manual edits exit history mode.
- `[CHANGED]` `components/chat/ChatPanel.tsx`: `useMemo` derives `promptHistory` (deduped, in send order) and passes it as `<ChatInput history={...} />`.

##### v10-10 `[NEW]` Modern message layout (user narrow-right, assistant full width, no bubble)
- `[CHANGED]` `chat.module.css`: `.messageBubbleUser` `max-width: 72%` solid bubble; `.messageBubbleAssistant` `max-width: 100%`, no background, no shadow, just a 2px accent-soft left border to demarcate the response; in `.panelExpanded` user bubbles tighten further to 56%.
- Long markdown / tables now read at full column width — major legibility win for finance answers.

##### v10-11 `[NEW]` Deep-thinking notice deferred + elapsed embedded in answer
- `[CHANGED]` `components/chat/ChatMessages.tsx`: active-stream `<ResponseNotice deferAfterSeconds={4}>` only fades in when the wait crosses 4 seconds; the entire block disappears when `isStreaming` flips off. Per-message historical banners removed (only `<TraceAccordion>` remains for inspection).
- `[CHANGED]` `components/chat/MessageBubble.tsx`: derives `elapsedSeconds` from `message.traces` first/last timestamps; renders an `Answered in Xs` pill at the bubble bottom (`.elapsedBadge`, tokenised).

##### v10-12 `[CHANGED]` Revert dashed line is now clickable
- `[CHANGED]` `components/chat/RevertSeparator.tsx`: hint phase upgraded from `<motion.div>` to `<motion.button>`, copy "Hold to revert" → "Click to revert"; `handleHintClick` jumps straight to the armed phase (no need to keep hovering for 700ms).
- `[CHANGED]` `chat.module.css`: `.revertSeparatorHint` resets native button chrome, adds hover/focus-visible.

##### v10-13 `[NEW]` Responsive breakpoints (mobile / tablet / desktop / wide)
- `[CHANGED]` `chat.module.css`:
  - `.panelDefault` width `clamp(320px, 30vw, 420px)`, height `clamp(440px, 70vh, 640px)`;
  - `.panelExpanded` width `clamp(720px, 70vw, 1180px)`;
  - `@media (max-width: 480px)` — full-screen sheet `100dvh`, bubbles 86%;
  - `@media (481–768px)` — tablet bottom sheet `min(94vw, 520px)`;
  - `@media (769–1279px)` — desktop expanded `min(80vw, 980px)`;
  - `@media (≥1280px)` — wide screens cap `messagesArea` at `88ch` centred (so long answers stay readable);
  - `@media (≥1920px)` — ultrawide tightens further to `min(60vw, 1180px)`;
  - `@media (prefers-reduced-motion: reduce)` — disables all transitions.

##### v10-14 `[NEW]` Design-token layer (colors + radii + shadows)
- `[CHANGED]` `chat.module.css` top of file adds the token block: `--nbk-accent / --nbk-accent-soft / --nbk-accent-strong / --nbk-success / --nbk-success-soft / --nbk-danger / --nbk-danger-soft / --nbk-muted / --nbk-line / --nbk-line-strong / --nbk-radius-{sm,md,lg} / --nbk-shadow-{soft,lift}`. Unifies scattered `color-mix()` and hard-coded `#ef4444 / #16a34a / #b8413f`.

#### Verification

```bash
# 1) Typecheck (production code 0 errors; __tests__ vitest types missing — pre-existing)
npx tsc --noEmit

# 2) Spin up the dev server, smoke in the browser
docker exec my-ubuntu-dev bash -lc 'cd repos/neobanker-frontend-MVP-V3 && npm run dev'
curl -I http://127.0.0.1:3000/bank-info/demo-bank/overview
```

UI acceptance checklist lives in `docs/client-demo-guide.en.md` v10 section.

#### Risks
- v10-13 mobile `100dvh` falls back to `100vh` on older Safari without dvh support; address-bar collapse may flash one frame.
- v10-7 cross-page reveal relies on a 1.5s `requestAnimationFrame` poll after `router.push`; slow networks may miss the highlight. A `MutationObserver` upgrade is a follow-up.
- v10-4 some Linux browsers return 0 voices from `getVoices()`; we fall back to the browser default voice in that case.

---

## 2026-04-16

### v9 `[NEW]` Modern chatbot overhaul — edit/branch / slash commands / Cmd+K / voice input / drag-drop injection / safe Markdown / feedback & TTS

#### Background
After v8 the chatbot had desktop-grade animation polish and a context-card story, but three "modern chatbot" pillars were still missing:
1. **Reversible message governance** — no edit, no revert, no regenerate; revert mistakes were costly and left no audit trail.
2. **Keyboard-native flow** — no `/` commands, no Cmd+K palette, no shortcuts; demos depended on hand-and-mouse choreography.
3. **Modern rich interactions** — no thumbs up/down, no read-aloud, no voice input, no drag-drop context, no long-message collapse, no citation jump, no persona/region badge, no empty-state guides.

This patch lands all of them in one batch, while keeping the animation/physics tuning **scoped to the chatbot only** — the rest of the app sees zero regression.

#### Changes

##### Schema / state layer (backwards-compatible v1 schema; legacy messages get an id hydrated on load)
- `[CHANGED]` `components/chat/types.ts`: `MessageBase` adds `id`, `supersededAt?`, `branchId?`; `AssistantMessage.feedback?`, `ContextMessage.sourceId?`, `ChatSessionArchive.pinned?`, `ChatState.conversationTitle?`, `InteractionStep.type` += `'branch'`; new actions `RENAME_SESSION` / `TRUNCATE_FROM` / `SET_FEEDBACK` / `TOGGLE_PIN_ARCHIVE` + matching context callbacks.
- `[CHANGED]` `contexts/ChatContext.tsx`: `generateId()` shared by message + conversation; `hydrateMessage()` lazily ids legacy entries; `markSupersededFrom()` only flags (does not delete) — full audit trail preserved; persistence payload now includes `conversationTitle`.

##### User message three-piece + danger-zone revert (three-stage misclick prevention)
- `[NEW]` `components/chat/MessageActions.tsx`: hover-revealed Copy / Edit & Resend / Regenerate icon buttons sitting beside each user bubble; rich tooltip microcopy ("Edit & resend — forks a new branch from here", etc.); 24/26px visual density.
- `[NEW]` `components/chat/EditMessageModal.tsx`: ⌘/Ctrl+Enter to send, Esc to cancel; explicit "this hides N downstream messages (audit log preserved)" copy.
- `[NEW]` `components/chat/RevertSeparator.tsx`: between-message hover affordance with three phases — `idle` (invisible 6px) → `hinted` (300ms dashed line + "Hold to revert") → `armed` (1000ms amber danger band + "Discard N messages"); Esc/mouseleave cancels at any phase.
- `[CHANGED]` `components/chat/MessageBubble.tsx`: `onRequestRevert` / `onRequestEdit` / `onRequestRegenerate` props plumbed in; removed dead `simpleMarkdown`; long answers (>1400 chars) collapse with show-full toggle.

##### Safe Markdown + citation jump + code-block copy
- `[NEW]` `components/chat/MarkdownView.tsx`: react-markdown + remark-gfm + rehype-raw + rehype-sanitize (allow-list for `data-citation` and `language-` only); `[N]` / `[citation:N]` becomes a clickable pill badge.
- `[NEW]` `components/chat/CodeBlock.tsx`: dark-panel block with language label + Copy button (success state for 1.5s via shared `useActionFeedback`).
- `[CHANGED]` `components/chat/SourcesFooter.tsx`: each row emits `data-source-row={i+1}`; `MessageBubble.handleCitationJump` scrolls + plays a 1.2s pulse on the matching row.

##### Assistant feedback / read-aloud / long-message collapse
- `[NEW]` `components/chat/AssistantFeedback.tsx`: thumbs up / down (mutually exclusive toggle) + TTS read-aloud (Web Speech `speechSynthesis`; click again to stop).

##### Slash commands + Cmd+K palette + keyboard shortcuts
- `[NEW]` `components/chat/commands.ts`: 17 commands — general (`/summary /rename /clear /pin /expand /collapse /copy /export`) + Neobanker-specific (`/compare /find /attach /persona /region /tier /source /audit /explain /idp`); `parseSlashInput()` / `matchSlashCommands()` / `matchPaletteCommands()`.
- `[NEW]` `components/chat/SlashAutocomplete.tsx`: appears as soon as you type `/`; arrow keys navigate, Tab/Enter selects, Esc cancels.
- `[NEW]` `components/chat/CommandPalette.tsx`: ⌘/Ctrl+K toggles; grouped sections (General / Neobanker); fuzzy match; Esc/Enter/arrows.
- `[CHANGED]` `components/chat/ChatPanel.tsx`: global ⌘/Ctrl+K listener opens the palette; ⌘/Ctrl+/ pre-fills the input with `/`.

##### Voice input (Web Speech API)
- `[NEW]` `components/chat/hooks/useVoiceInput.ts`: thin wrapper around `SpeechRecognition` / `webkitSpeechRecognition`; streams interim transcripts to the input field; recording state flips the button to active.
- `[CHANGED]` `components/chat/ChatInput.tsx`: voice button on the left (only renders when supported); 1.06× breathing scale during recording; SlashAutocomplete + keyboard routing also wired here.

##### Drag-drop card injection + "N new messages" indicator + empty-state guides
- `[CHANGED]` `components/chat/InjectContextButton.tsx`: button wrapped in a `<span draggable onDragStart>`; `dataTransfer.setData('application/x-neobanker-context', payload)` carries component/data/sourceId; click-to-inject behaviour preserved.
- `[CHANGED]` `components/chat/ChatPanel.tsx`: panel container handles `onDragOver`/`onDrop`, recognises the same MIME type and calls `injectContext()`; semi-transparent dashed drop-zone overlay during drag.
- `[NEW]` `components/chat/EmptyStateGuides.tsx`: 4 starter cards (Bank overview / Compare / Find a card / Explain a process) — click sends the prompt directly.
- `[CHANGED]` `components/chat/ChatMessages.tsx`: when scrolled away from the bottom, a floating "N new messages ↓" pill appears; click smooth-scrolls back; `RevertSeparator` is rendered after each user message that has downstream content.

##### Pin / persona / toolbar microcopy sweep
- `[CHANGED]` `components/chat/ChatPanel.tsx`: toolbar gains a Pin toggle button, palette entry (⚡), and persona badge; session select sorts pinned conversations first with a 📌 prefix.
- `[CHANGED]` Across the chat directory: every Tooltip rewritten as "behaviour + value" copy (e.g. "Edit & resend — forks a new branch from here").

##### CSS (all scoped to the chat module)
- `[NEW]` `components/chat/chat.module.css`: ~430 new lines — `userActions` / `userActionBtn` / `assistantFeedback` / `actionBtnDanger`/`Active` / `revertSeparator{,Hint,Armed}` / `editModal{Backdrop,Header,...}` / `citationBadge` / `nbkSourceRowFlash` keyframes / `newMessagesIndicator` / `longMessage{Wrap,Collapsed,Toggle}` / `dropZoneOverlay` / `personaBadge` / `slashMenu*` / `commandPalette*` / `voiceBtn(Active)` / `emptyStateGrid/Card` / `pinnedSessionPin` + `pinToggleBtn` / `branchNav`.

#### Verification
```bash
docker exec -w /workspace/repos/neobanker-frontend-MVP-V3 my-ubuntu-dev bash -lc \
  "npx tsc --noEmit 2>&1 | grep -E 'error TS' | grep -v __tests__"   # ✅ no production errors
curl -I http://127.0.0.1:3000/homepage                                # 200
```

#### Risks
- `useVoiceInput` silently hides the button on non-Chromium browsers (other than Safari Tech Preview); intentional, but flag in the demo guide.
- `truncateFrom` only sets `supersededAt`; the backend doesn't yet consume it — UI hides them but the audit channel must still run end-to-end before this can be cited as compliance evidence.
- TTS uses the browser default voice; OS-to-OS variance is large — preview before any client-facing demo.
- Cmd+K may collide with the browser address-bar shortcut. We `preventDefault()`, but Safari can still intercept; ⌘/Ctrl+/ is wired as a fallback.

---

### v4 `[NEW]` Session Summary v1 button

#### Background
The agent's meta-query channel (v4 on the agent side) already answers "summarize our chat" from in-request history, but the entry point still required the user to type. The client + compliance-audit flows wanted a one-click trigger.

#### Changes
- `[NEW]` `components/chat/ChatPanel.tsx`: `compactToolbar` gets a new 📄 `FileTextOutlined` button between New-session and Session-select; `handleSummarize()` calls `useSSE.sendMessage('Summarize our conversation so far with key topics and decisions.')`; `disabled={isStreaming || !hasConversation}`.
- `[NEW]` `components/chat/chat.module.css`: `.compactSummaryBtn` uses `var(--primary, #2563eb)` outline with white fill, hover flips; a semantic contrast with the red `.compactNewBtn` (new session = alert red; summary = primary blue).

#### Validation
```bash
docker exec -w /workspace/repos/neobanker-frontend-MVP-V3 my-ubuntu-dev bash -lc 'npx eslint components/chat/ChatPanel.tsx'   # ✅ clean
docker exec -w /workspace/repos/neobanker-frontend-MVP-V3 my-ubuntu-dev bash -lc 'npx tsc --noEmit 2>&1 | grep components/chat'   # ✅ no errors
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/homepage   # 200
```

#### Risks
- Summary prompt is hard-coded English; Chinese sessions still answer in Chinese, but the triggering user bubble shows the English prompt — v2 will i18n.
- No rate-limit; relies on `isStreaming` to block rapid clicks.

### v3 `[NEW]` T5 polish: warm-red context card / chips wrap / sources type-vs-content / silent Check-online

#### Background
After in-person review of v2 four issues stood out:
1. Context bubble's green accent read as washed-out; a first attempt at a multi-hue gradient felt gimmicky. Target: red + amber, financial-professional, muted contrast.
2. Chips in a horizontal scrollbar were rejected — wrap to multiple lines instead, chip visuals unchanged.
3. Sources block had a row of blue reference `Tag` pills above the dashed divider, and the items below mixed "type" (`Internal DB` / `Wikipedia`) with "content" (`management`, article titles) in a flat blob.
4. The **Check online** button should silently fire a web search instead of posting a visible "Yes, please check online…" user bubble into the stream.

Two latent bugs surfaced during the fix:
- `useChatContext().sendMessage` only dispatched `SEND_MESSAGE` and never `fetch`ed the SSE endpoint — v2's Check-online button had never actually wired through from the UI (prior smoke tests used curl, not the button).
- No `hidden` flag on user messages — impossible to have a message persist in history without rendering.

#### Changes
- `[CHANGED]` `components/chat/chat.module.css`
  - Context bubble: warm-red + amber gradient header with low-contrast body; `.contextCardHeader` titled `Context attached` with a `PushpinFilled` icon.
  - Chips: `flex-wrap: wrap; overflow: hidden` — multi-line wrapping, no scrollbar; chip dimensions/typography untouched.
  - Sources: removed the blue reference Tag row above the dashed divider; each item is now `tier-dot + .sourcesFooterType` pill (tier-tinted) + `.sourcesFooterContent` (bold 600) + optional `.sourcesFooterDomain` monospace pill (warm-red border).
- `[CHANGED]` `components/chat/ContextCard.tsx`
  - Split into header/body: header always shows the `attached` label; body holds the summary + expandable detail.
- `[CHANGED]` `components/chat/SourcesFooter.tsx`
  - `typeLabel(provider)` maps provider → short type label (`Internal DB` / `Wikipedia` / `Web` / `Context card` …).
  - `contentLabel(source)` extracts the right-hand side of `—` in the title as the "content" for `database` / `frontend_context` sources (e.g. `management`); other providers fall back to title or domain.
- `[NEW] / [CHANGED]` `components/chat/MessageBubble.tsx`
  - Uses `useSSE()` directly to obtain `sendMessage` (the previously used `useChatContext().sendMessage` was a zombie that never hit the backend).
  - `message.type === 'user' && message.hidden` returns `null` — the message still enters state/history but never renders.
  - Check online button now dispatches a `{ hidden: true }` follow-up message instead of polluting the chat stream.
- `[CHANGED]` `components/chat/types.ts`
  - `Message.user` gains `hidden?: boolean`; `ChatAction.SEND_MESSAGE` gains `hidden?: boolean`; `ChatContextValue.sendMessage` accepts `options?: { hidden?: boolean }`.
- `[CHANGED]` `contexts/ChatContext.tsx` + `components/chat/hooks/useSSE.ts`
  - `SEND_MESSAGE` reducer writes the `hidden` flag; `useSSE.sendMessage` accepts `options?.hidden` and threads it through dispatch.

#### Validation
| Check | How | Result |
|---|---|---|
| TS / Lint | `docker exec … npm run lint` | ✅ pass |
| Silent Check-online + explicit "search online" | SSE round-trip | ✅ No `[offer_web_search]` emitted; button click stores a hidden user message in history but never renders it |

---

### v2 `[NEW]` T5 follow-ups: Owners in hover border / chips back to horizontal scroll / context card lifted

#### Background
Colleagues flagged after v1:
1. The Establishment hover border **still doesn't include Owners** — it stops at founder.
2. The context bubble in the chatbot **doesn't look different enough** from user/assistant messages.
3. The new chips use `flex-wrap`; when there are many they occupy several rows and squeeze the messages off-screen. The dividing line between chips and the last message also looked unnecessary.
4. The `[offer_web_search]` Check-online button sent only `Yes, please…`, dropping the original question so the planner had no subject; and ask mode would not call `web_search` even after a clear user consent.

#### Changes
- `[NEW]` `app/(default)/bank-info/[sortId]/overview/page.tsx`
  - Moved the Owners row **inside `.overviewEstablishmentSection`**, so the `:has(> .botIcon:hover)` flowing border now wraps subtitle + establishedTime + founder + Owners.
  - `injectContext` payload adds `owners` (formatted `Name (percent%)` list) so the agent sees it.
- `[NEW]` `components/chat/chat.module.css`
  - `.chipsContainer`: `flex-wrap: nowrap` + `overflow-x: auto` (thin scrollbar), **dropped the `border-top`** — back to the old horizontal-scroll layout. Many chips no longer squash the message area.
  - `.suggestionChip`: `white-space: nowrap` + `flex-shrink: 0` to live inside a single scrolling row (visual design unchanged — user only wanted the container behaviour reverted).
  - `.messageBubbleContext`: left 3px green accent bar (`::before`), 14% green tint + 45% green border + soft shadow; `.contextSummary` title tinted and the paperclip glyph coloured — the context bubble is now instantly distinguishable.
- `[NEW]` `components/chat/MessageBubble.tsx`
  - Check-online button now appends the **most recent user message**: `Yes, please check online and attach the source URLs for: <original question>` so the planner keeps the subject.

#### Validation
| Check | Command / action | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` filtered to non-`__tests__` | ✅ Zero new errors |
| Hover border | `/bank-info/demo-bank/overview` hover the icon | ✅ Border wraps subtitle + establishedTime + founder + Owners together |
| Many chips | 6+ suggestions returned | ✅ Single horizontal-scroll row; separator line gone |
| Context card | Any injection | ✅ Green accent bar + border + tinted background — clearly a context attachment |
| Check online | Ask CEO → receive offer → click button | ✅ Dispatches "Yes, please check online…: What is the background of the CEO of ZA Bank"; planner fires `web_search` and returns Calvin Ng info with sources |

#### Risk & follow-ups
- Thin scrollbar uses `scrollbar-width/color` on Firefox, WebKit pseudo-elements elsewhere.
- Context card green pulls from the `--chatbot-soft-green` CSS var; theme changes need to sync it.
- The agent v1 today ships the paired prompt update: an explicit user consent now bypasses ask-mode and jumps straight to `web_search`.

---

### v1 `[NEW]` T5 reliability badge UI + P3 re-fix + chatbot polish

#### Background
Pairs with the Agent T5 delivery (the SSE payload now carries `reliability`), plus a second round of P3 feedback:
1. The Establishment robot icon must not sit inline with the subtitle — it distorts the whole card's layout. Place it at the **top-right of the entire subsection**.
2. The hover border should encircle the whole block (subtitle + establishedTime + founder), not just the word `Establishment`.
3. Chatbot polish: expose the search provider used (via Wikipedia / DuckDuckGo / Playwright scrape / …), distinguish the 5 tiers visually, and push suggestion chips + context cards closer to a Linear/Stripe level of professionalism — "fancy but not too fancy".

#### Changes
- `[NEW]` `app/(default)/bank-info/[sortId]/overview/page.tsx`
  - Wraps the Establishment subsection (subtitle + establishedTime + founder) in a new `.overviewEstablishmentSection` container. The robot button goes back to absolute positioning at the container's top-right. The container also carries `chatStyles.botIconContainer`, so the `:has(> .botIcon:hover)` flowing border now traces the whole subsection.
- `[NEW]` `app/(default)/bank-info/[sortId]/overview/overview.module.css`
  - Added `.overviewEstablishmentSection { display: flex; flex-direction: column; align-items: flex-start; width: 100%; }`.
- `[NEW]` `components/chat/chat.module.css`
  - Dropped the previous `.botIconInline` (no longer needed after P3 reverts to absolute).
  - Added the 5-tier palette (`--tier-fg / --tier-bg / --tier-border`): `verified` green / `official` blue / `reference` amber / `web` orange / `ai_generated` red. Drives badges, hover tooltips, and source-footer dots from one place.
  - Added `.reliabilityBadge`, `.reliabilityTooltip` (pure CSS hover, up to 3 sources + "+N more"), `.sourcesFooter`, `.offerWebSearchBtn`, `.suggestionChip` (semantic `<button>`, replaces antd Tag), `.assistantActions` copy/export. Assistant bubbles gain a soft shadow + subtle hover lift to match the Linear/Stripe vibe.
- `[NEW]` `components/chat/types.ts`
  - Added `ReliabilityTier / ReliabilitySource / ReliabilityEnvelope / AssistantSegment`; attached optional `reliability` to assistant `Message` and the `SSE_RESPONSE` action.
- `[NEW]` `contexts/ChatContext.tsx`
  - `SSE_RESPONSE` propagates the agent's `reliability` envelope into the stored assistant message.
- `[NEW]` `components/chat/ReliabilityBadge.tsx`
  - 5 glyphs (`SafetyCertificate / Bank / Book / Global / Experiment`), `compact` variant for bubble corners; hover tooltip surfaces the tier label, provider, and up to 3 sources with links.
- `[NEW]` `components/chat/SourcesFooter.tsx`
  - Compact inline list under the message body: tier-coloured dots + domain + link; header reads `Sources · via {provider}`.
- `[NEW]` `components/chat/MessageBubble.tsx`
  - Detects the LLM's `[offer_web_search]` marker, strips it from display, and renders a `Check online` button that dispatches `Yes, please check online and attach the source URLs.` to run the next turn through auto mode.
  - Renders the compact badge in a right-aligned slot and `SourcesFooter` below the content.
- `[NEW]` `components/chat/SuggestedChips.tsx`
  - Replaced antd Tag with a semantic `<button>` + `.suggestionChip` for proper focus/hover affordances.

#### Validation
| Check | Command / action | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` filtered to non-`__tests__` files | ✅ Zero new errors (pre-existing testing-library noise unchanged) |
| Badge & tooltip | Manual hover across Verified/Official/Reference/Web/AI-generated bubbles | ✅ Colours + `+N more` correct |
| Establishment subsection | `/bank-info/demo-bank/overview` hover the robot | ✅ Flowing border wraps subtitle + establishedTime + founder |
| Offer mode | Questions the DB cannot answer (e.g. CEO background) | ✅ `Check online` button appears; click fires the next auto-search turn |

#### Risk & follow-ups
- Per-segment badges (`AssistantSegment`) are scaffolded in `types.ts`, but the planner still produces single-segment text. We render a single whole-bubble badge + sources footer for now and will light up segments once the planner emits them.
- `:has()` requires modern browsers (Chrome 105+ / Safari 15.4+ / Firefox 121+); older browsers gracefully drop the border effect.
- The badge tooltip lives inside `.botIconContainer`, so tier-hover does not cross-trigger the icon's border animation.

---

## 2026-04-15

### v2 `[NEW]` P2/P3/P4 Chatbot entrypoint UX fixes (product-highlight injection / establishment icon position / hover border)

#### Background
After shipping v1 to colleagues, three UX issues surfaced:
1. Clicking the robot icon on the Products > Highlights card only injects a few fields — product link, description, features/benefits, tags, segment were missing.
2. On the Overview page, the Establishment subsection's robot icon is absolutely positioned at `top:8px right:8px`, stacking on top of the About card's icon.
3. The colourful hover border fires whenever any part of the wrapped component is hovered; users want it scoped to the robot icon itself, and ask for an animated flowing gradient.

#### Goals
- Give the agent enough product context so it stops parroting the card back.
- Fix the stacked icons on Overview without touching card layout or ordering.
- Rebuild the hover border: reveal only while the robot icon itself is hovered; paint a flowing red → amber → green → blue → purple → red gradient ring.

#### Changes
- `[NEW]` `app/(default)/bank-info/[sortId]/products/page.tsx`
  - `InnovativeProducts` payload expanded with `productLink / description / features / benefits / clientTagText / innovative / customerSegment` (last one via `resolveCustomerSegment`).
  - `Highlights` now uses `useBankContext`, attaches `bankName`, and ships the full `productsByType` array with every `ProductCard` field so the agent sees complete product rows.
- `[NEW]` `app/(default)/bank-info/[sortId]/overview/page.tsx`
  - The Establishment button gains `chatStyles.botIconInline` alongside `chatStyles.botIcon`, flipping it from absolute to inline and eliminating overlap with the About icon.
- `[NEW]` `components/chat/chat.module.css`
  - Added `.botIconInline`: `position: static; width/height: 20px; margin-right: 6px; vertical-align: middle;` for subtitle-row usage.
  - Replaced the simple `.botIconContainer:hover` outline with a `::before` pseudo-element + `mask-composite` hollow gradient ring; `background-size: 300%` + `chatBorderFlow` 4s linear loop, default `animation-play-state: paused`, only toggled to `running / opacity: 1` under `.botIconContainer:has(> .botIcon:hover)`. Direct-child `:has(>)` prevents nested containers from cross-triggering.

#### Validation
| Check | Command / action | Result |
|---|---|---|
| Lint (touched files) | `npm run lint` filtered to `overview/page` & `products/page` | ✅ No new errors (pre-existing noise unchanged) |
| `:has()` support | Chrome 105+ / Safari 15.4+ / Firefox 121+ | ✅ Supported in current browser matrix |

#### Risk & follow-ups
- `:has()` on older browsers degrades to "no border" — icon behaviour unaffected.
- If legacy browser support is ever required, fall back to a JS hover listener.
- Up next: T5 (online-search fallback + reliability badges) will introduce further chatbot response chrome; we will reconcile border/badge visuals then.

---

### v1 M4 customer segmentation: retail/corporate tabs + segment resolver

#### Goals
1. Add Retail / Corporate / All tabs on the bank-info Products page.
2. Introduce a `customerSegment` field on `ProductCard` with a `resolveCustomerSegment()` fallback (backward-compatible with `clientTag`).
3. Update the demoBank fixture so the no-backend demo flow can exercise segment switching end-to-end.

#### Changes
- Model: `app/model/company/company.ts`
  - `ProductCard.customerSegment?: 'retail' | 'corporate'`.
  - New `CustomerSegment` type (`'all' | 'retail' | 'corporate'`).
  - New `resolveCustomerSegment()`: prefers `customerSegment`, falls back to `clientTag` mapping (mirrors the agent-side `client_tag -> customer_segment` derivation).
- Page: `app/(default)/bank-info/[sortId]/products/page.tsx`
  - `ProductLists` owns segment state and renders a tablist (All / Retail / Corporate).
  - `RenderProductList` accepts a `segment` prop and filters its product list client-side via `resolveCustomerSegment`.
  - Product-type summary gating maps by segment (retail→Personal, corporate→Coroprate, all→either).
  - When filtering produces an empty view but raw data exists, show "No {segment} products in this category."
- Styles: `products.module.css` adds `.segmentTabs` / `.segmentTab` / `.segmentTabActive` / `.segmentEmpty`.
- Mock: `app/mock/demoBank.ts` tags all 5 demo products with `customerSegment` (Nova Account / Card / Save → retail; Nova SME Hub / Flex Credit → corporate).

#### Validation
| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | ✅ 0 errors on M4 files (pre-existing unrelated TS errors remain) |
| Playwright smoke | Navigate to `/bank-info/demo-bank/products`, switch tab | ✅ tablist visible, tab clicks switch active state |

Pairs with agent-side commit `4f49f5c` (M4 intent + planner wiring) to close the T4 M4 loop.

## 2026-04-13

### v1 demo-bank, CI/CD hardening, and container validation

#### Goals
1. Keep Chatbot demo flow available (demo-bank without backend dependency).
2. Fix and harden frontend CI/CD.
3. Run executable validation inside Docker.

#### Key commits
| Commit | Description |
|---|---|
| `8d3fa92` | added demo-bank chatbot fallback docs |
| `3370c88` | added frontend demo-bank data fallback |
| `6eabbd2` | deploy workflow adjustment |
| `942dd47` | fixed CI path for missing `test` script |
| `4380ad9` | keep `__tests__` local-only |
| `b68bc15` | merged latest main features |

#### Main changes
1. Added demo-bank fixture route for backend-free chatbot context-card demo.
2. Added docs for demo-bank URL and injected context payload fields.
3. Hardened CI/CD behavior around missing test-script scenarios.

### v2 Node version debugging and fix (container)

#### Root-cause analysis
| Item | Result |
|---|---|
| Next.js version | `14.2.33` |
| Official Next.js requirement | Node.js `>=18.17.0` |
| Original container default | Node `v12.22.9` (incompatible) |

#### Fix actions
1. Switched to the newer Node already installed through container `nvm` (`v24.14.1`).
2. Repointed `/usr/local/bin/node|npm|npx` to the nvm version so commands no longer fall back to `/usr/bin/node v12`.
3. Fixed container DNS resolution by updating `/etc/resolv.conf` nameservers to `8.8.8.8` / `1.1.1.1`, unblocking Google Fonts fetch during build.

#### Validation results
| Check | Command | Result |
|---|---|---|
| Version check | `docker exec my-ubuntu-dev bash -lc 'node -v; npm -v'` | ✅ `v24.14.1 / 11.11.0` |
| Build path (without lint gate) | `npm run build -- --no-lint` | ✅ Next.js production build completed successfully |
| Lint | `npm run lint` | ⚠️ fails on pre-existing lint debt (not a Node-version issue) |

#### Conclusion
- The original “frontend command fails directly due to Node version mismatch” issue is fixed.
- Remaining item: existing lint debt in the repository (independent from the Node-version issue).

### v3 Refresh 500 fix (`@clerk` vendor chunk missing)

#### Symptom
- Browser refresh returned HTTP 500:
  - `Error: Cannot find module './vendor-chunks/@clerk.js'`
  - observed on `/bank-info/[sortId]/overview`.

#### Root cause
1. A long-running `next dev` process was serving while `.next/server` artifacts were overwritten by other build operations, creating runtime/chunk mismatch.
2. At failure time, `.next/server/vendor-chunks` did not contain `@clerk.js` while `webpack-runtime.js` still referenced it.

#### Fix actions
1. Stop the stale `next dev` process (specific PID).
2. Remove `.next` cache directory.
3. Restart frontend dev server and wait for readiness.

```bash
docker exec my-ubuntu-dev bash -lc 'kill <NEXT_DEV_PID>'
docker exec my-ubuntu-dev bash -lc 'cd /workspace/repos/neobanker-frontend-MVP-V3 && rm -rf .next && nohup npm run dev > /workspace/logs/frontend-dev.log 2>&1 &'
```

#### Regression verification
- Ran 3 refresh rounds over 12 key routes (36 requests total): all returned `200`, no `@clerk` chunk error.
- Ran 10 consecutive refresh checks on `bank-info/demo-bank/overview`: all returned `200`.

### v4 Dev script log-path alignment (Agent)

#### Changes
- Updated Agent startup segment in `dev-docker.sh`:
  1. runtime log path -> `neobanker-agent/logs/runtime/agent.log`
  2. pid file path -> `neobanker-agent/logs/runtime/agent.pid`
  3. default session log dir -> `neobanker-agent/logs/sessions`
  4. preserved compatibility symlinks at `/workspace/logs/agent.log|agent.pid`
  5. auto-migrates legacy logs to the new paths on first run

#### Impact
- Log storage is now repo-scoped for easier debugging and archival with code context.
- Existing troubleshooting commands keep working through symlinks.

#### Validation
| Check | Command | Result |
|---|---|---|
| Script syntax | `bash -n dev-docker.sh` | ✅ pass |

### v5 Chatbot session persistence and history search

#### Goals
1. Keep the active chat session after browser refresh.
2. Improve context continuity so follow-up questions retain context-card signals.
3. Add in-panel history search for long conversations.

#### Changes
- `contexts/ChatContext.tsx`
  - added local persistence via `localStorage (neobanker_chat_state_v1)`.
  - restores `conversationId/messages/suggestions` on load.
  - resets transient streaming state on restore (`status=idle`).
  - added session archive flow: `New chat` archives the previous session for later recall.
  - added interaction-path recording: `context_click / user_message / assistant_response`.
- `components/chat/hooks/useSSE.ts`
  - history payload strategy upgraded from fixed last-20 to a mixed window that retains recent context messages.
  - appends recent interaction-path summary as context in outbound requests.
- `components/chat/ChatPanel.tsx` + `components/chat/chat.module.css`
  - added conversation search input to filter user/assistant/context messages by keyword.
  - added session toolbar (`New chat`, archived-session select, archive-hit quick jump buttons).
- `components/chat/MessageBubble.tsx` + `components/chat/chat.module.css`
  - added `Export` action on assistant messages to download the current answer as Markdown.
- docs:
  - added a new section in `docs/environment-setup.md` for session persistence and search behavior.

#### Validation
| Check | Command | Result |
|---|---|---|
| Frontend build (with TS checks) | `docker exec my-ubuntu-dev ... npm run build -- --no-lint` | ✅ pass |
| Frontend route availability | `curl -I http://127.0.0.1:3000/homepage` | ✅ `200 OK` |

### v6 Visual layout regression recovery (runtime)

#### Symptom
- Pages degraded to near plain-text column layout, with major visual styling missing.

#### Root cause
- Corrupted/mismatched `.next` runtime artifacts under `next dev`, causing missing server chunks:
  - `Cannot find module './584.js'`
  - `Cannot find module './682.js'`
- Chunk failures pushed pages into error fallback flow, so style resources were not applied correctly.

#### Fix actions
1. Stop current `next dev` process (PID-targeted kill).
2. Remove frontend `.next` cache directory.
3. Restart `npm run dev` and wait for recompilation readiness.

#### Validation
| Check | Command | Result |
|---|---|---|
| `/homepage` repeated requests | `curl -m 20 -w "%{http_code}" .../homepage` ×6 | ✅ all `200` |
| `/bank-info/demo-bank/overview` repeated requests | `curl -m 20 -w "%{http_code}" .../overview` ×6 | ✅ all `200` |
| Error-fallback payload check | HTML contains `\"statusCode\":500` | ✅ not present |
| CSS asset availability | `/_next/static/css/...` | ✅ key stylesheet assets all `200` |

### v7 Chat UX refinement (session controls, intro, copy/conditional export)

#### Goals
1. Simplify and restyle `Current/New/Search` controls with a compact warm-light-red section.
2. Restore default self-introduction guidance when opening an empty chat.
3. Adjust assistant actions: copy for every answer; export only for structured table-like answers.

#### Changes
- `components/chat/ChatPanel.tsx`
  - rebuilt session controls into one compact row:
    - `New` icon button
    - `Current` session selector
    - search input with icon
    - match-count badge
  - removed large archive-hit quick-jump list to reduce occupied space.
- `components/chat/chat.module.css`
  - added compact warm-red control styles (`compactToolbar*` family),
  - added empty-session intro card styles (`introCard`, `introTitle`, `introText`),
  - unified assistant action button style (`assistantActionBtn`) for copy/export.
- `components/chat/ChatMessages.tsx`
  - now renders default intro content when chat is empty and idle:
    - `👋 你好，我是 Neobanker Assistant。`
    - guidance text for supported questions and context-injection entry.
- `components/chat/MessageBubble.tsx`
  - added `Copy` action for all assistant messages.
  - changed `Export` to conditional display (only when Markdown table structure is detected).
  - added table detector helper `containsMarkdownTable`.
- test updates (local test assets):
  - `__tests__/MessageBubble.test.tsx` updated with copy/export expectations.
  - `__tests__/ChatMessages.test.tsx` updated with empty-chat intro expectations.

#### Runtime recovery and verification
- Encountered another `.next` runtime artifact mismatch (`@clerk` vendor chunk missing), then recovered by:
  1. PID-targeted stop of `next dev`,
  2. removing `.next`,
  3. restarting frontend dev server.
- Route checks after restart:
  - `curl http://127.0.0.1:3000/homepage` -> ✅ `200`
  - `curl http://127.0.0.1:3000/bank-info/demo-bank/overview` -> ✅ `200`

### v8 Chat control polish (icon-only actions, hover-search, stronger red, wrapped suggestions)

#### Goals
1. Make `copy/stop` icon-only, with hover tooltips.
2. Add tooltip guidance for top session controls, and convert search to hover-expand / leave-collapse interaction.
3. Switch the chat control accent to a more vivid theme red.
4. Remove horizontal scrollbar from suggestion chips and use multi-line wrapping.

#### Changes
- `components/chat/ChatPanel.tsx`
  - added tooltips for `New/Session/Search/Count`,
  - changed search behavior:
    - default icon-only state,
    - expand + autofocus on hover/focus/click,
    - collapse on mouse leave / input blur.
- `components/chat/ChatInput.tsx`
  - `Stop` changed to icon-only button with tooltip.
- `components/chat/MessageBubble.tsx`
  - `Copy/Export` changed to icon-only buttons with tooltips.
- `components/chat/SuggestedChips.tsx` + `components/chat/chat.module.css`
  - suggestion tags now wrap; horizontal overflow removed.
- `components/chat/chat.module.css`
  - vivid red palette update (`#ef4444` family) for chat controls,
  - added animated search expand/collapse styles (`compactSearchInputWrap*`).

#### Validation
| Check | Command | Result |
|---|---|---|
| Targeted lint on changed chat files | `npx next lint --file components/chat/ChatPanel.tsx --file components/chat/ChatInput.tsx --file components/chat/MessageBubble.tsx --file components/chat/SuggestedChips.tsx` | ✅ pass |
| Route availability | `curl http://127.0.0.1:3000/homepage` | ✅ `200` |
| Route availability | `curl http://127.0.0.1:3000/bank-info/demo-bank/overview` | ✅ `200` |

### v9 Search navigation and highlight upgrade

#### Goals
1. Fix search collapse behavior when query is empty and pointer leaves.
2. Add concrete search-result navigation (first-hit focus, highlight, prev/next, current/total).
3. Replace “error-like match badge” with neutral navigation-style indicators.

#### Changes
- `components/chat/ChatPanel.tsx`
  - refined collapse rules:
    - empty query + mouse leave => collapse + remove input focus,
    - empty query + input blur => collapse.
  - added match navigation:
    - auto-jump to first match,
    - previous/next controls,
    - `current/total` match indicator (for example `2/7`).
  - when query is empty, shows total message count indicator instead of a match badge.
- `components/chat/ChatMessages.tsx`
  - added active-match highlighting and auto-scroll-to-match behavior.
- `components/chat/chat.module.css`
  - added navigator and match-highlight styles (`searchNavigator`, `searchNavBtn`, `searchMatchActive`),
  - restyled match badge to neutral (no error-like red alert look).

#### Validation
| Check | Command | Result |
|---|---|---|
| Targeted lint on changed chat files | `npx next lint --file components/chat/ChatPanel.tsx --file components/chat/ChatMessages.tsx --file components/chat/ChatInput.tsx --file components/chat/MessageBubble.tsx --file components/chat/SuggestedChips.tsx` | ✅ pass |
| Route availability | `curl http://127.0.0.1:3000/homepage` | ✅ `200` |
| Route availability | `curl http://127.0.0.1:3000/bank-info/demo-bank/overview` | ✅ `200` |
