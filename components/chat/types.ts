export interface Reference {
  tool: string;
  table: string;
}

export type ReliabilityTier =
  | "verified"
  | "official"
  | "reference"
  | "web"
  | "ai_generated";

export interface ReliabilitySource {
  title: string;
  url: string;
  provider: string;
  tier: ReliabilityTier;
}

export interface ReliabilityEnvelope {
  tier: ReliabilityTier;
  sources: ReliabilitySource[];
  provider_used: string | null;
}

export interface TraceStep {
  event: "thinking" | "intent" | "tool_call" | "tool_result";
  data: any;
  timestamp: number;
}

export interface InteractionStep {
  type: "context_click" | "user_message" | "assistant_response" | "branch";
  timestamp: number;
  component?: string;
  summary?: string;
}

export interface AssistantSegment {
  text: string;
  tier: ReliabilityTier;
  sources?: ReliabilitySource[];
}

export type MessageFeedback = "up" | "down" | null;

interface MessageBase {
  /** Stable client-generated id used for editing, regeneration, branch
   *  tracking and citation jumps. Always present for messages created
   *  after the v9 schema upgrade; legacy persisted messages get an id
   *  hydrated on load. */
  id: string;
  /** Set when a message is no longer in the active thread (truncated by
   *  edit/regenerate/revert) but kept for audit. The UI hides these from
   *  the visible thread; persistence keeps them. */
  supersededAt?: number;
  /** Branch id grouping sibling alternatives created by edit/regenerate. */
  branchId?: string;
}

export type UserMessage = MessageBase & {
  type: "user";
  content: string;
  hidden?: boolean;
};

export type AssistantMessage = MessageBase & {
  type: "assistant";
  content: string;
  references: Reference[];
  traces: TraceStep[];
  reliability?: ReliabilityEnvelope;
  segments?: AssistantSegment[];
  feedback?: MessageFeedback;
  /** Marks a message that was synthesised from a SSE_ERROR event so the
   *  bubble renders with the error skin (warn icon, friendly copy,
   *  collapsible raw payload, retry). */
  error?: boolean;
  /** Original raw error payload (Python traceback string) preserved for
   *  the collapsible "details" pane when error === true. */
  errorRaw?: string;
};

export type ContextMessage = MessageBase & {
  type: "context";
  component: string;
  data: Record<string, any>;
  /** DOM data-attribute id of the source component, used by the
   *  "Reveal source" button to scroll back and pulse the original card. */
  sourceId?: string;
  /** Pathname of the page where the inject button was clicked. Lets the
   *  reveal action route back to the right page when the user is no
   *  longer there. */
  sourcePath?: string;
};

export type Message = UserMessage | AssistantMessage | ContextMessage;

export interface ChatSessionArchive {
  conversationId: string;
  updatedAt: number;
  title: string;
  messages: Message[];
  suggestions: string[];
  interactionPath: InteractionStep[];
  pinned?: boolean;
}

export type PanelState = "closed" | "default" | "expanded";
export type ChatStatus = "idle" | "streaming" | "error";

/** Online-search policy:
 *   - "always":   always run web_search alongside the DB lookup.
 *   - "fallback": auto-run web_search whenever the DB returns nothing.
 *   - "ask":      legacy behaviour — surface an "Online Search?" chip
 *                 and let the user decide. Default. */
export type OnlineMode = "always" | "fallback" | "ask";

export interface ChatState {
  panelState: PanelState;
  status: ChatStatus;
  conversationId: string;
  conversationTitle?: string;
  messages: Message[];
  suggestions: string[];
  activeTraces: TraceStep[];
  interactionPath: InteractionStep[];
  archives: ChatSessionArchive[];
  onlineMode: OnlineMode;
}

export type ChatAction =
  | { type: "SEND_MESSAGE"; content: string; hidden?: boolean }
  | { type: "INJECT_CONTEXT"; component: string; data: Record<string, any>; sourceId?: string; sourcePath?: string }
  | { type: "SSE_THINKING"; data: any }
  | { type: "SSE_INTENT"; data: any }
  | { type: "SSE_TOOL_CALL"; data: any }
  | { type: "SSE_TOOL_RESULT"; data: any }
  | {
      type: "SSE_RESPONSE";
      data: {
        text: string;
        references: Reference[];
        reliability?: ReliabilityEnvelope;
      };
    }
  | { type: "SSE_SUGGESTIONS"; suggestions: string[] }
  | { type: "SSE_ERROR"; message: string }
  | { type: "SSE_DONE" }
  | { type: "SET_PANEL_STATE"; panelState: PanelState }
  | { type: "SET_ONLINE_MODE"; mode: OnlineMode }
  | { type: "ABORT" }
  | { type: "START_NEW_CHAT" }
  | { type: "LOAD_ARCHIVE"; conversationId: string }
  | { type: "RENAME_SESSION"; title: string }
  | { type: "TRUNCATE_FROM"; messageId: string }
  | { type: "SET_FEEDBACK"; messageId: string; feedback: MessageFeedback }
  | { type: "TOGGLE_PIN_ARCHIVE"; conversationId: string }
  | { type: "RENAME_ARCHIVE"; conversationId: string; title: string }
  | { type: "DELETE_ARCHIVE"; conversationId: string };

export interface ChatContextValue {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (text: string, options?: { hidden?: boolean }) => void;
  injectContext: (
    component: string,
    data: Record<string, any>,
    sourceId?: string,
    sourcePath?: string,
  ) => void;
  abort: () => void;
  setPanelState: (s: PanelState) => void;
  setOnlineMode: (mode: OnlineMode) => void;
  startNewChat: () => void;
  loadArchive: (conversationId: string) => void;
  renameSession: (title: string) => void;
  truncateFrom: (messageId: string) => void;
  setFeedback: (messageId: string, feedback: MessageFeedback) => void;
  togglePin: (conversationId: string) => void;
  renameArchive: (conversationId: string, title: string) => void;
  deleteArchive: (conversationId: string) => void;
}

export const CONTEXT_CHIP_KEYS: Record<string, string> = {
  ceo: "context.chipCeo",
  founder: "context.chipFounder",
  founded: "context.chipFounded",
  establishedTime: "context.chipEstablishedTime",
  revenue: "context.chipRevenue",
  employees: "context.chipEmployees",
  companySize: "context.chipCompanySize",
  location: "context.chipLocation",
  licenses: "context.chipLicenses",
  bankCode: "context.chipBankCode",
  bankSwift: "context.chipBankSwift",
};
