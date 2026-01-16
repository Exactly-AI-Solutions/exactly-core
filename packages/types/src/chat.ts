/**
 * Chat session
 */
export interface ChatSession {
  id: string;
  tenantId: string;
  sessionId: string; // Client-generated UUID
  createdAt: Date;
  lastActiveAt: Date;
  metadata: Record<string, unknown>;
}

/**
 * Chat message role
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Chat message
 */
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  parts?: MessagePart[];
  attachments?: MessageAttachment[];
  /** Components to render inline (e.g., Calendly) */
  components?: ChatComponent[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Message part (for rich content)
 */
export interface MessagePart {
  type: 'text' | 'tool-call' | 'tool-result' | 'image';
  content: unknown;
}

/**
 * Message attachment
 */
export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

/**
 * Message vote (feedback)
 */
export interface MessageVote {
  id: string;
  messageId: string;
  sessionId: string;
  isUpvoted: boolean;
  createdAt: Date;
}

/**
 * Chat request body
 */
export interface ChatRequest {
  messages: Array<{
    role: MessageRole;
    content: string;
  }>;
}

/**
 * Streaming response event types
 */
export type StreamEventType =
  | 'text-delta'
  | 'tool-call'
  | 'tool-result'
  | 'component'
  | 'done'
  | 'error';

/**
 * Streaming response event
 */
export interface StreamEvent {
  type: StreamEventType;
  content?: string;
  name?: string;
  args?: unknown;
  result?: unknown;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
  /** Component to render (for component events) */
  component?: string;
  /** Props for the component */
  props?: Record<string, unknown>;
}

/**
 * Component types that can be rendered in chat
 */
export type ChatComponentType = 'calendly';

/**
 * Component instruction from tool result
 */
export interface ChatComponent {
  type: ChatComponentType;
  props: Record<string, unknown>;
}
