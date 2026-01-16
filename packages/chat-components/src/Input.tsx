import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, style, ...props }: InputProps) {
  return (
    <input
      style={{
        width: '100%',
        padding: '10px 12px',
        border: `1px solid ${error ? '#EF4444' : '#E5E7EB'}`,
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.2s',
        ...style,
      }}
      {...props}
    />
  );
}
