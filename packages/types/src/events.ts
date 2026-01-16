/**
 * Base event interface - all events extend this
 */
export interface BaseEvent {
  id: string;
  type: string;
  timestamp: number; // Unix ms
  tenantId: string;
  sessionId?: string;
  userId?: string; // Future: authenticated user
  metadata: Record<string, unknown>;
}

/**
 * Event types
 */
export type EventType =
  // Chat events
  | 'chat.message.sent'
  | 'chat.message.received'
  | 'chat.session.created'
  | 'chat.session.ended'
  // Widget events
  | 'widget.opened'
  | 'widget.closed'
  | 'widget.suggestion.clicked'
  | 'widget.action.clicked'
  | 'widget.feedback.submitted'
  // System events
  | 'error.occurred'
  | 'workflow.started'
  | 'workflow.completed'
  | 'workflow.failed';

/**
 * Chat message sent event
 */
export interface ChatMessageSentEvent extends BaseEvent {
  type: 'chat.message.sent';
  metadata: {
    messageId: string;
    role: 'user' | 'assistant';
    contentLength: number;
    hasAttachments: boolean;
  };
}

/**
 * Session created event
 */
export interface SessionCreatedEvent extends BaseEvent {
  type: 'chat.session.created';
  metadata: {
    url: string;
    referrer?: string;
    userAgent: string;
  };
}

/**
 * Widget opened event
 */
export interface WidgetOpenedEvent extends BaseEvent {
  type: 'widget.opened';
  metadata: {
    url: string;
    referrer?: string;
    userAgent: string;
  };
}

/**
 * Widget closed event
 */
export interface WidgetClosedEvent extends BaseEvent {
  type: 'widget.closed';
  metadata: {
    duration: number; // ms widget was open
    messageCount: number;
  };
}

/**
 * Widget suggestion clicked event
 */
export interface WidgetSuggestionClickedEvent extends BaseEvent {
  type: 'widget.suggestion.clicked';
  metadata: {
    suggestionText: string;
    suggestionIndex: number;
  };
}

/**
 * Widget feedback submitted event
 */
export interface WidgetFeedbackEvent extends BaseEvent {
  type: 'widget.feedback.submitted';
  metadata: {
    messageId: string;
    isUpvoted: boolean;
  };
}

/**
 * Error event
 */
export interface ErrorEvent extends BaseEvent {
  type: 'error.occurred';
  metadata: {
    errorCode: string;
    errorMessage: string;
    stack?: string;
    context?: Record<string, unknown>;
  };
}

/**
 * All event types union
 */
export type ExactlyEvent =
  | ChatMessageSentEvent
  | SessionCreatedEvent
  | WidgetOpenedEvent
  | WidgetClosedEvent
  | WidgetSuggestionClickedEvent
  | WidgetFeedbackEvent
  | ErrorEvent;
