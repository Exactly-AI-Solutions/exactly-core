'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  component?: {
    type: string;
    props: Record<string, unknown>;
  };
}

interface InlineChatProps {
  initialMessage: string;
  onClose: () => void;
  apiUrl: string;
  tenantId: string;
  // Session persistence props
  sessionId: string;
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
}

const defaultSuggestions = [
  'Analyze my homepage',
  'Generate a quick win',
  'What can Exactly do?',
];

// Filter out JSON tool results that may appear in message content
function cleanMessageContent(content: string): string {
  let cleaned = content;
  // Remove JSON objects that look like component tool results (e.g., {"component":"calendly",...})
  cleaned = cleaned.replace(/\{"component":\s*"[^"]*"[^}]*\}/g, '');
  // Remove JSON objects that look like quick win tool results (e.g., {"quick_win_type":"...","quick_win_content":"..."})
  // This regex matches the opening JSON and quick_win_type, then captures everything after quick_win_content":"
  cleaned = cleaned.replace(/\{"quick_win_type"\s*:\s*"[^"]*"\s*,\s*"quick_win_content"\s*:\s*"/g, '');
  // Remove trailing "} from quick win JSON
  cleaned = cleaned.replace(/"\s*\}$/g, '');
  // Clean up any double newlines or excess whitespace
  cleaned = cleaned.replace(/\\n/g, '\n').trim();
  return cleaned;
}

// Calendly inline widget component
function CalendlyWidget({ url }: { url: string }) {
  useEffect(() => {
    // Load Calendly script if not already loaded
    if (!document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div
      className="calendly-inline-widget"
      data-url={url}
      style={{
        minWidth: '320px',
        height: '400px',
        marginTop: '12px',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
}

export default function InlineChat({
  initialMessage,
  onClose,
  apiUrl: rawApiUrl,
  tenantId,
  sessionId,
  messages,
  onMessagesChange,
}: InlineChatProps) {
  // Normalize API URL to remove trailing slashes
  const apiUrl = rawApiUrl.replace(/\/+$/, '');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(defaultSuggestions);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialMessageSent = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async (content: string, currentMessages: Message[]) => {
    if (!content.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', content };
    const updatedMessages = [...currentMessages, newUserMessage];

    onMessagesChange(updatedMessages);
    setInput('');
    setIsLoading(true);
    // Hide suggestions while loading
    setSuggestionsVisible(false);

    try {
      const response = await fetch(`${apiUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId,
          'X-Session-Id': sessionId,
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let assistantComponent: Message['component'] | undefined;

      // Add empty assistant message
      onMessagesChange([...updatedMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'text-delta') {
                assistantContent += data.content;
                onMessagesChange([
                  ...updatedMessages,
                  { role: 'assistant', content: assistantContent, component: assistantComponent },
                ]);
              } else if (data.type === 'component') {
                // Store component data to render (e.g., Calendly widget)
                assistantComponent = {
                  type: data.component,
                  props: data.props || {},
                };
                onMessagesChange([
                  ...updatedMessages,
                  { role: 'assistant', content: assistantContent, component: assistantComponent },
                ]);
              } else if (data.type === 'suggestions') {
                // Update suggestions with contextual ones from AI
                if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
                  setSuggestions(data.suggestions);
                  // Reveal suggestions with animation
                  setTimeout(() => setSuggestionsVisible(true), 100);
                }
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      onMessagesChange([
        ...updatedMessages,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
      // Show default suggestions on error
      setSuggestions(defaultSuggestions);
      setSuggestionsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, isLoading, sessionId, tenantId, onMessagesChange]);

  // Send initial message on mount (only once, and only if no messages exist)
  useEffect(() => {
    if (initialMessage && !initialMessageSent.current && messages.length === 0) {
      initialMessageSent.current = true;
      sendMessage(initialMessage, []);
    }
  }, [initialMessage, messages.length, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input, messages);
    }
  };

  const handleSuggestedAction = (action: string) => {
    sendMessage(action, messages);
  };

  const handleCopy = async (content: string, index: number) => {
    const cleanedContent = cleanMessageContent(content);
    try {
      await navigator.clipboard.writeText(cleanedContent);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '20px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.3), 0 0 80px rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.3)',
        overflow: 'hidden',
        animation: 'expandChat 0.3s ease-out',
        width: '100%',
      }}
    >
      <style>{`
        @keyframes expandChat {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .chat-markdown p {
          margin: 0 0 8px 0;
        }
        .chat-markdown p:last-child {
          margin-bottom: 0;
        }
        .chat-markdown ul, .chat-markdown ol {
          margin: 8px 0;
          padding-left: 20px;
        }
        .chat-markdown li {
          margin: 4px 0;
        }
        .chat-markdown code {
          background: rgba(0,0,0,0.05);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
        }
        .chat-markdown pre {
          background: rgba(0,0,0,0.05);
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 8px 0;
        }
        .chat-markdown pre code {
          background: none;
          padding: 0;
        }
        .chat-markdown strong {
          font-weight: 600;
        }
        .chat-markdown a {
          color: #FF6B35;
          text-decoration: underline;
        }
        .suggestion-btn:hover:not(:disabled) {
          border-color: #FF6B35;
          color: #FF6B35;
          background: #FFF5F2;
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            color: '#666',
            fontSize: '20px',
            lineHeight: 1,
            fontWeight: '300',
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        style={{
          height: '400px',
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? '#E8ECF4' : '#F3F4F6',
                color: '#1a1a1a',
                fontSize: '14px',
                lineHeight: '1.5',
                textAlign: 'left',
              }}
            >
              {msg.content || msg.component ? (
                msg.role === 'assistant' ? (
                  <>
                    {msg.content && cleanMessageContent(msg.content) && (
                      <div className="chat-markdown">
                        <ReactMarkdown>{cleanMessageContent(msg.content)}</ReactMarkdown>
                      </div>
                    )}
                    {msg.component?.type === 'calendly' && (
                      <CalendlyWidget url={msg.component.props.url as string} />
                    )}
                  </>
                ) : (
                  msg.content
                )
              ) : (
                <span style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ animation: 'blink 1.4s infinite', animationDelay: '0s' }}>●</span>
                  <span style={{ animation: 'blink 1.4s infinite', animationDelay: '0.2s' }}>●</span>
                  <span style={{ animation: 'blink 1.4s infinite', animationDelay: '0.4s' }}>●</span>
                </span>
              )}
            </div>
            {/* Copy button underneath assistant messages */}
            {msg.role === 'assistant' && msg.content && cleanMessageContent(msg.content) && (
              <button
                onClick={() => handleCopy(msg.content, idx)}
                title={copiedIndex === idx ? 'Copied!' : 'Copy'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '4px',
                  padding: '4px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: copiedIndex === idx ? '#10B981' : '#9CA3AF',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (copiedIndex !== idx) {
                    e.currentTarget.style.color = '#6B7280';
                  }
                }}
                onMouseLeave={(e) => {
                  if (copiedIndex !== idx) {
                    e.currentTarget.style.color = '#9CA3AF';
                  }
                }}
              >
                {copiedIndex === idx ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#F3F4F6',
              borderRadius: '24px',
              padding: '8px 12px',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '14px',
                color: '#333',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                background: '#FF6B35',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s',
              }}
            >
              <span style={{ color: 'white', fontSize: '14px' }}>→</span>
            </button>
          </div>
        </form>

        {/* Suggested Actions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '12px',
            justifyContent: 'center',
            opacity: suggestionsVisible ? 1 : 0,
            transform: suggestionsVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          {suggestions.map((suggestion, idx) => (
            <button
              key={`${suggestion}-${idx}`}
              onClick={() => handleSuggestedAction(suggestion)}
              disabled={isLoading || !suggestionsVisible}
              className="suggestion-btn"
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '12px',
                color: '#374151',
                cursor: isLoading ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                opacity: suggestionsVisible ? 1 : 0,
                transform: suggestionsVisible ? 'translateY(0)' : 'translateY(4px)',
                transitionDelay: `${idx * 50}ms`,
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
