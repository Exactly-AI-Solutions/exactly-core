interface ToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
  position: 'bottom-right' | 'bottom-left';
  primaryColor: string;
}

export function ToggleButton({ isOpen, onClick, position, primaryColor }: ToggleButtonProps) {
  const positionStyles =
    position === 'bottom-left'
      ? { left: '20px', right: 'auto' }
      : { right: '20px', left: 'auto' };

  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
      style={{
        position: 'fixed',
        bottom: '20px',
        ...positionStyles,
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: primaryColor,
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isOpen ? (
        // Close icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        // Chat icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
        </svg>
      )}
    </button>
  );
}
