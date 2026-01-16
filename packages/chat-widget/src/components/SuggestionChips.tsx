interface SuggestionChipsProps {
  suggestions: string[];
  onClick: (suggestion: string, index: number) => void;
}

export function SuggestionChips({ suggestions, onClick }: SuggestionChipsProps) {
  return (
    <div
      className="exactly-suggestion-chips"
      style={{
        padding: '0 16px 12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onClick(suggestion, index)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#F3F4F6',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#4B5563',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E5E7EB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
          }}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
