import { useState, useCallback, useRef, useEffect } from 'react';
import type { TenantUIConfig, ChatMessage, QuickActionConfig, ChatComponent } from '@exactly/types';
import { ChatContainer } from './components/ChatContainer';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { SuggestionChips } from './components/SuggestionChips';
import { QuickActionButtons } from './components/QuickActionButtons';
import { ToggleButton } from './components/ToggleButton';
import { sendMessage, submitVote, type StreamHandler, type ComponentEvent } from './lib/api';
import { telemetry } from './lib/telemetry';

interface ChatWidgetProps {
  config: TenantUIConfig;
  tenantId: string;
  sessionId: string;
  apiUrl: string;
  /** Optional handoff ID for pre-seeded context */
  handoffId?: string;
}

export function ChatWidget({ config, tenantId, sessionId, apiUrl, handoffId }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const streamingContentRef = useRef('');
  const pendingComponentsRef = useRef<ChatComponent[]>([]);

  // Listen for custom event to open the chatbot
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      telemetry.track({
        type: 'widget.opened',
        metadata: {
          url: window.location.href,
          trigger: 'programmatic',
        },
      });
    };

    window.addEventListener('exactly:open', handleOpen);
    return () => window.removeEventListener('exactly:open', handleOpen);
  }, []);

  const handleToggle = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);

    telemetry.track({
      type: newState ? 'widget.opened' : 'widget.closed',
      metadata: {
        url: window.location.href,
        messageCount: messages.length,
      },
    });
  }, [isOpen, messages.length]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Add user message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sessionId,
        role: 'user',
        content,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setStreamingContent('');

      // Track message sent
      telemetry.track({
        type: 'chat.message.sent',
        metadata: {
          messageId: userMessage.id,
          role: 'user',
          contentLength: content.length,
          hasAttachments: false,
        },
      });

      // Reset refs for new stream
      streamingContentRef.current = '';
      pendingComponentsRef.current = [];

      // Stream handler
      const streamHandler: StreamHandler = {
        onTextDelta: (delta) => {
          streamingContentRef.current += delta;
          setStreamingContent(streamingContentRef.current);
        },
        onComponent: (componentEvent: ComponentEvent) => {
          // Store component to attach to the final message
          pendingComponentsRef.current.push({
            type: componentEvent.component as 'calendly',
            props: componentEvent.props,
          });
        },
        onDone: (usage) => {
          // Convert streaming content to message using ref (avoids stale closure)
          const finalContent = streamingContentRef.current;
          const components = pendingComponentsRef.current.length > 0
            ? [...pendingComponentsRef.current]
            : undefined;
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              sessionId,
              role: 'assistant',
              content: finalContent || 'No response received',
              components,
              createdAt: new Date(),
              metadata: { usage },
            },
          ]);
          streamingContentRef.current = '';
          pendingComponentsRef.current = [];
          setStreamingContent('');
          setIsLoading(false);
        },
        onError: (error) => {
          console.error('[ExactlyChat] Stream error:', error);
          streamingContentRef.current = '';
          pendingComponentsRef.current = [];
          setStreamingContent('');
          setIsLoading(false);
        },
      };

      try {
        await sendMessage(
          tenantId,
          sessionId,
          messages.concat(userMessage).map((m) => ({ role: m.role, content: m.content })),
          apiUrl,
          streamHandler,
          handoffId
        );
      } catch (error) {
        console.error('[ExactlyChat] Failed to send message:', error);
        setIsLoading(false);
      }
    },
    [tenantId, sessionId, messages, isLoading, streamingContent, apiUrl, handoffId]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string, index: number) => {
      telemetry.track({
        type: 'widget.suggestion.clicked',
        metadata: {
          suggestionText: suggestion,
          suggestionIndex: index,
        },
      });
      handleSend(suggestion);
    },
    [handleSend]
  );

  const handleVote = useCallback(
    async (messageId: string, isUpvoted: boolean) => {
      telemetry.track({
        type: 'widget.feedback.submitted',
        metadata: {
          messageId,
          isUpvoted,
        },
      });
      await submitVote(messageId, tenantId, sessionId, isUpvoted, apiUrl);
    },
    [tenantId, sessionId, apiUrl]
  );

  const handleQuickAction = useCallback(
    (action: QuickActionConfig) => {
      telemetry.track({
        type: 'widget.action.clicked',
        metadata: {
          actionId: action.id,
          actionLabel: action.label,
          actionType: action.type,
        },
      });

      if (action.type === 'link') {
        window.open(action.action, '_blank', 'noopener,noreferrer');
      } else {
        // For non-link actions, send as a message
        handleSend(action.label);
      }
    },
    [handleSend]
  );

  return (
    <>
      <ToggleButton
        isOpen={isOpen}
        onClick={handleToggle}
        position={config.theme.position}
        primaryColor={config.theme.primaryColor}
      />

      {isOpen && (
        <ChatContainer theme={config.theme}>
          <div className="exactly-chat-header">
            <span>{config.greeting}</span>
          </div>

          <MessageList
            messages={messages}
            streamingContent={streamingContent}
            isLoading={isLoading}
            showTypingIndicator={config.components.typingIndicator}
            showFeedbackButtons={config.components.feedbackButtons}
            onVote={handleVote}
          />

          {config.components.suggestions &&
            messages.length === 0 &&
            config.suggestedPrompts && (
              <SuggestionChips
                suggestions={config.suggestedPrompts}
                onClick={handleSuggestionClick}
              />
            )}

          {config.components.quickActions &&
            messages.length > 0 &&
            config.quickActionButtons && (
              <QuickActionButtons
                actions={config.quickActionButtons}
                onActionClick={handleQuickAction}
                primaryColor={config.theme.primaryColor}
              />
            )}

          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            placeholder={config.placeholderText}
          />
        </ChatContainer>
      )}
    </>
  );
}
