# Frontend regression test catalog

> Standard: [`repos/liulian-agent/docs/standards/test-discipline.md`](../../../liulian-agent/docs/standards/test-discipline.md) §11

## Why this directory exists

Any behavior that has *ever* been broken — discovered by AI self-review,
the user, QA, or a flaky test that turned out to be a real regression —
gets a dedicated test here that pins the exact behavior so the same fix
cannot silently regress later.

This protects the chatbot UI in particular: refactors of `components/chat/**`
are frequent, and visual regressions (chip overlay positioning, scroll
behavior, message bubble layout in flex-column parents) are easy to
re-introduce without a guarding test.

## File naming

```
__tests__/regression/<short_id>.test.tsx
```

`<short_id>` ≈ ticket id, commit SHA prefix, or one-word symptom.
Examples: `chip-fly-overlay-resize.test.tsx`, `messages-area-flex-shrink.test.tsx`.

## SOP for adding a regression test

1. **Reproduce minimally** — strip to the smallest component tree that fails
2. **Write a RED test** — assert the *fixed* behavior; verify it fails on the broken commit
3. **Apply the fix** — confirm the new test goes green
4. **Run lint + relevant tests** — `npm run lint` + targeted Jest run
5. **PR description** — list 现象 / 根因 / 守护用例路径

## Special note for chat-panel UI

The recurring failure mode "child of `.messagesArea` (flex column) gets
squeezed below content height as the thread grows" (see memory
`feedback_flex_shrink_zero_in_flex_columns.md`) **must** have a regression
test that grows the thread to ≥ 3 turns before any layout assertion.
Single-turn render passes mask the bug.

## Backfill policy

R7-R8 already-fixed chatbot regressions should be backfilled here when
the same area is touched again (rule R8 + test-discipline.md §11.2).
