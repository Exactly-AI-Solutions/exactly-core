import { useEffect, useRef } from 'react';
import type { ChatMessage, ChatComponent } from '@exactly/types';
import { FeedbackButtons } from './FeedbackButtons';
import { CalendlyEmbed } from './CalendlyEmbed';

interface MessageListProps {
  messages: ChatMessage[];
  streamingContent: string;
  isLoading: boolean;
  showTypingIndicator: boolean;
  showFeedbackButtons: boolean;
  onVote?: (messageId: string, isUpvoted: boolean) => Promise<void>;
}

export function MessageList({
  messages,
  streamingContent,
  isLoading,
  showTypingIndicator,
  showFeedbackButtons,
  onVote,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div
      className="exactly-message-list"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          showFeedback={showFeedbackButtons && message.role === 'assistant'}
          onVote={onVote}
        />
      ))}

      {/* Streaming message */}
      {streamingContent && (
        <div
          className="exactly-message exactly-message-assistant"
          style={{
            alignSelf: 'flex-start',
            maxWidth: '80%',
            padding: '12px 16px',
            borderRadius: '12px 12px 12px 4px',
            backgroundColor: '#F3F4F6',
            color: '#1F2937',
          }}
        >
          {streamingContent}
        </div>
      )}

      {/* Typing indicator */}
      {isLoading && showTypingIndicator && !streamingContent && (
        <div
          className="exactly-typing-indicator"
          style={{
            alignSelf: 'flex-start',
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: '#F3F4F6',
          }}
        >
          <span className="exactly-typing-dots">
            <span style={{ animation: 'blink 1.4s infinite both' }}>●</span>
            <span style={{ animation: 'blink 1.4s infinite both 0.2s' }}>●</span>
            <span style={{ animation: 'blink 1.4s infinite both 0.4s' }}>●</span>
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  showFeedback: boolean;
  onVote?: (messageId: string, isUpvoted: boolean) => Promise<void>;
}

function MessageBubble({ message, showFeedback, onVote }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`exactly-message-wrapper exactly-message-${message.role}`}
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: isUser ? '80%' : '95%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="exactly-message-content"
        style={{
          padding: '12px 16px',
          borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
          backgroundColor: isUser ? 'var(--exactly-primary, #0066FF)' : '#F3F4F6',
          color: isUser ? '#FFFFFF' : '#1F2937',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {message.content}
      </div>

      {/* Render embedded components */}
      {message.components && message.components.map((component, index) => (
        <ComponentRenderer key={index} component={component} />
      ))}

      {showFeedback && onVote && (
        <FeedbackButtons messageId={message.id} onVote={onVote} />
      )}
    </div>
  );
}

/**
 * Renders a component based on its type
 */
function ComponentRenderer({ component }: { component: ChatComponent }) {
  switch (component.type) {
    case 'calendly':
      return (
        <CalendlyEmbed
          url={component.props.url as string}
          prefill={component.props.prefill as {
            name?: string;
            email?: string;
            customAnswers?: Record<string, string>;
          }}
        />
      );
    default:
      console.warn(`Unknown component type: ${component.type}`);
      return null;
  }
}
