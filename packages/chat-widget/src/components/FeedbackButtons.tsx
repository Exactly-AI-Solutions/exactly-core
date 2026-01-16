import { useState } from 'react';

interface FeedbackButtonsProps {
  messageId: string;
  onVote: (messageId: string, isUpvoted: boolean) => Promise<void>;
}

export function FeedbackButtons({ messageId, onVote }: FeedbackButtonsProps) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (isUpvoted: boolean) => {
    if (isSubmitting) return;

    const newVote = isUpvoted ? 'up' : 'down';

    // Toggle off if clicking same vote
    if (vote === newVote) {
      setVote(null);
      return;
    }

    setIsSubmitting(true);
    try {
      await onVote(messageId, isUpvoted);
      setVote(newVote);
    } catch (error) {
      console.error('[ExactlyChat] Failed to submit vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: isSubmitting ? 'wait' : 'pointer',
    opacity: isSubmitting ? 0.5 : 1,
    color: isActive ? '#10B981' : '#9CA3AF',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
  });

  return (
    <div
      className="exactly-feedback-buttons"
      style={{
        display: 'flex',
        gap: '4px',
        marginTop: '4px',
      }}
    >
      <button
        onClick={() => handleVote(true)}
        style={buttonStyle(vote === 'up')}
        disabled={isSubmitting}
        title="Helpful"
        onMouseEnter={(e) => {
          if (vote !== 'up') {
            e.currentTarget.style.color = '#6B7280';
          }
        }}
        onMouseLeave={(e) => {
          if (vote !== 'up') {
            e.currentTarget.style.color = '#9CA3AF';
          }
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={vote === 'up' ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      </button>

      <button
        onClick={() => handleVote(false)}
        style={buttonStyle(vote === 'down')}
        disabled={isSubmitting}
        title="Not helpful"
        onMouseEnter={(e) => {
          if (vote !== 'down') {
            e.currentTarget.style.color = '#6B7280';
          }
        }}
        onMouseLeave={(e) => {
          if (vote !== 'down') {
            e.currentTarget.style.color = '#9CA3AF';
          }
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={vote === 'down' ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
        </svg>
      </button>
    </div>
  );
}
