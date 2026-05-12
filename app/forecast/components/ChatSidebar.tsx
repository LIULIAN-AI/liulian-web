'use client';

/**
 * Chat sidebar for the BI agent.
 *
 * Connects to liulian-agent at /agents/bi/invoke via Server-Sent Events
 * (same wire-shape as neobanker-agent: thinking / trace / intent /
 * tool_call / tool_result / response / suggestions / done).
 *
 * Render style per PLATFORM_DESIGN.md §4.3: *notebook, not chat*.
 * Tool calls render as inline method-call lines in JetBrains Mono;
 * plain-text responses in Switzer; no avatar bubbles.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

type AgentEvent =
  | { type: 'thinking'; data: { message: string } }
  | { type: 'trace'; data: { step: string; detail?: string } }
  | { type: 'intent'; data: { intent: string; entities?: string[] } }
  | { type: 'tool_call'; data: { tool: string; input: Record<string, unknown> } }
  | { type: 'tool_result'; data: { tool: string; output: unknown } }
  | { type: 'response'; data: { text: string; references?: { id: string; text: string }[] } }
  | { type: 'suggestions'; data: string[] }
  | { type: 'done'; data: null };

type Step = {
  kind: 'thinking' | 'tool' | 'response';
  text: string;
  tool?: string;
  input?: Record<string, unknown>;
  output?: unknown;
};

const T = {
  ink: '#131313',
  inkMuted: '#666A70',
  inkFaint: '#94989D',
  hairline: '#E8E7E2',
  bern: '#E20613',
  surface: '#FFFFFF',
  surfaceShade: '#FAFAF9',
  body: 'Switzer, sans-serif',
  mono: 'JetBrains Mono, ui-monospace, monospace',
  display: 'Fraunces, serif',
};

export type ChatSidebarProps = {
  agentBaseUrl?: string;
  persona?: 'data' | 'model' | 'bi';
};

export default function ChatSidebar({
  agentBaseUrl = process.env.NEXT_PUBLIC_AGENT_URL || 'http://localhost:8001',
  persona = 'bi',
}: ChatSidebarProps) {
  const [query, setQuery] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps, suggestions]);

  const ask = useCallback(
    async (text: string) => {
      if (!text.trim() || busy) return;
      setBusy(true);
      setError(null);
      setSteps(prev => [...prev, { kind: 'thinking', text }]);
      try {
        const r = await fetch(`${agentBaseUrl}/agents/${persona}/invoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
          body: JSON.stringify({ message: text }),
        });
        if (!r.ok || !r.body) throw new Error(`agent returned ${r.status}`);

        const reader = r.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          // SSE frames separated by double newline
          let idx;
          while ((idx = buf.indexOf('\n\n')) !== -1) {
            const frame = buf.slice(0, idx);
            buf = buf.slice(idx + 2);
            const ev = parseSseFrame(frame);
            if (ev) applyEvent(ev, setSteps, setSuggestions);
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    },
    [agentBaseUrl, persona, busy]
  );

  return (
    <aside
      style={{
        background: T.surface,
        border: `1px solid ${T.hairline}`,
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: T.body,
        overflow: 'hidden',
      }}
      aria-label={`${persona} agent`}
    >
      <header
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${T.hairline}`,
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: T.inkFaint,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{persona} agent</span>
        <span>{busy ? '● working' : '○ idle'}</span>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', fontSize: 13, lineHeight: 1.55 }}>
        {steps.length === 0 && (
          <p
            style={{
              fontFamily: T.display,
              fontStyle: 'italic',
              color: T.inkMuted,
              margin: 0,
            }}
          >
            {persona === 'bi'
              ? 'Ask in plain English. Examples: "Show stations where Q95 went above 850 last week." "Compare TimesNet and Chronos for Bern."'
              : persona === 'model'
              ? 'Given a dataset and a horizon, I recommend a model + an HPO space.'
              : 'I help shape datasets into manifests. Drop a CSV path or a MinIO URI.'}
          </p>
        )}

        {steps.map((s, i) => (
          <StepLine key={i} step={s} />
        ))}

        {error && (
          <div
            style={{
              border: `1px solid ${T.bern}`,
              borderRadius: 6,
              padding: '8px 12px',
              fontFamily: T.mono,
              fontSize: 11,
              color: T.bern,
              marginTop: 12,
            }}
          >
            agent error: {error}
          </div>
        )}

        {suggestions.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(s);
                  ask(s);
                }}
                style={{
                  textAlign: 'left',
                  background: 'transparent',
                  border: `1px solid ${T.hairline}`,
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontFamily: T.body,
                  fontSize: 12,
                  color: T.inkMuted,
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          ask(query);
          setQuery('');
        }}
        style={{
          borderTop: `1px solid ${T.hairline}`,
          padding: 8,
          display: 'flex',
          gap: 8,
          background: T.surfaceShade,
        }}
      >
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Ask the ${persona} agent…`}
          disabled={busy}
          style={{
            flex: 1,
            border: `1px solid ${T.hairline}`,
            borderRadius: 6,
            padding: '8px 12px',
            fontFamily: T.body,
            fontSize: 13,
            color: T.ink,
            background: T.surface,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={busy || !query.trim()}
          style={{
            border: 'none',
            borderRadius: 6,
            padding: '8px 14px',
            background: busy ? T.surfaceShade : T.ink,
            color: '#fff',
            fontFamily: T.body,
            fontSize: 13,
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          Ask
        </button>
      </form>
    </aside>
  );
}

function StepLine({ step }: { step: Step }) {
  if (step.kind === 'thinking') {
    return (
      <div style={{ color: T.ink, fontSize: 14, marginBottom: 12 }}>
        <span style={{ color: T.inkFaint, fontFamily: T.mono, fontSize: 11, marginRight: 8 }}>
          you
        </span>
        {step.text}
      </div>
    );
  }
  if (step.kind === 'tool') {
    return (
      <div
        style={{
          background: T.surfaceShade,
          border: `1px solid ${T.hairline}`,
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 10,
          fontFamily: T.mono,
          fontSize: 11,
          color: T.ink,
        }}
      >
        <div style={{ color: T.bern }}>
          [{step.tool}]
        </div>
        <div style={{ color: T.inkMuted, whiteSpace: 'pre-wrap', marginTop: 4 }}>
          {JSON.stringify(step.input, null, 2)}
        </div>
        {step.output !== undefined && (
          <div style={{ color: T.ink, whiteSpace: 'pre-wrap', marginTop: 6 }}>
            →{' '}
            {typeof step.output === 'string'
              ? step.output
              : JSON.stringify(step.output, null, 2).slice(0, 400)}
          </div>
        )}
      </div>
    );
  }
  // response
  return (
    <div style={{ color: T.ink, fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
      <span style={{ color: T.inkFaint, fontFamily: T.mono, fontSize: 11, marginRight: 8 }}>
        agent
      </span>
      {step.text}
    </div>
  );
}

function parseSseFrame(frame: string): AgentEvent | null {
  let eventName = 'message';
  let dataLines: string[] = [];
  for (const line of frame.split('\n')) {
    if (line.startsWith('event:')) eventName = line.slice(6).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
  }
  if (!dataLines.length) return null;
  try {
    return { type: eventName, data: JSON.parse(dataLines.join('\n')) } as AgentEvent;
  } catch {
    return null;
  }
}

function applyEvent(
  ev: AgentEvent,
  setSteps: React.Dispatch<React.SetStateAction<Step[]>>,
  setSuggestions: React.Dispatch<React.SetStateAction<string[]>>
): void {
  switch (ev.type) {
    case 'tool_call':
      setSteps(prev => [...prev, { kind: 'tool', text: '', tool: ev.data.tool, input: ev.data.input }]);
      break;
    case 'tool_result':
      setSteps(prev => {
        const last = prev[prev.length - 1];
        if (last?.kind === 'tool' && last.tool === ev.data.tool) {
          return [...prev.slice(0, -1), { ...last, output: ev.data.output }];
        }
        return [...prev, { kind: 'tool', text: '', tool: ev.data.tool, output: ev.data.output }];
      });
      break;
    case 'response':
      setSteps(prev => [...prev, { kind: 'response', text: ev.data.text }]);
      break;
    case 'suggestions':
      setSuggestions(ev.data);
      break;
    default:
      // thinking / trace / intent / done — surfaced via header indicator only
      break;
  }
}
