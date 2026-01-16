import type { QuickActionConfig } from '@exactly/types';

interface QuickActionButtonsProps {
  actions: QuickActionConfig[];
  onActionClick: (action: QuickActionConfig) => void;
  primaryColor?: string;
}

export function QuickActionButtons({
  actions,
  onActionClick,
  primaryColor = '#0066FF',
}: QuickActionButtonsProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <div
      className="exactly-quick-actions"
      style={{
        padding: '8px 16px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onActionClick(action)}
          style={{
            padding: '10px 16px',
            backgroundColor: 'transparent',
            border: `1.5px solid ${primaryColor}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            color: primaryColor,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = primaryColor;
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = primaryColor;
          }}
        >
          {action.type === 'link' && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          )}
          {action.label}
        </button>
      ))}
    </div>
  );
}
