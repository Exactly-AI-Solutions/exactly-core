import { useState, useCallback, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(() => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div
      className="exactly-chat-input"
      style={{
        padding: '12px 16px',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end',
      }}
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          padding: '10px 12px',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: '14px',
          lineHeight: '1.5',
          outline: 'none',
          minHeight: '44px',
          maxHeight: '120px',
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        style={{
          padding: '10px 16px',
          backgroundColor: disabled || !value.trim() ? '#E5E7EB' : 'var(--exactly-primary, #0066FF)',
          color: disabled || !value.trim() ? '#9CA3AF' : '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
          fontWeight: 500,
          fontSize: '14px',
        }}
      >
        Send
      </button>
    </div>
  );
}
