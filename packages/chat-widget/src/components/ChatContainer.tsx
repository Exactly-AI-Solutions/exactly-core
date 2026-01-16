import type { ReactNode } from 'react';
import type { TenantTheme } from '@exactly/types';

interface ChatContainerProps {
  children: ReactNode;
  theme: TenantTheme;
}

export function ChatContainer({ children, theme }: ChatContainerProps) {
  const positionStyles =
    theme.position === 'bottom-left'
      ? { left: '20px', right: 'auto' }
      : { right: '20px', left: 'auto' };

  return (
    <div
      className="exactly-chat-container"
      style={{
        position: 'fixed',
        bottom: '80px',
        ...positionStyles,
        width: '380px',
        height: '600px',
        maxHeight: 'calc(100vh - 100px)',
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        borderRadius: `${theme.borderRadius}px`,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 9999,
        // CSS variables for child components
        // @ts-expect-error CSS custom properties
        '--exactly-primary': theme.primaryColor,
        '--exactly-bg': theme.backgroundColor,
        '--exactly-text': theme.textColor,
        '--exactly-radius': `${theme.borderRadius}px`,
      }}
    >
      {children}
    </div>
  );
}
