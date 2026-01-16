export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, alt, fallback, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  const dimension = sizes[size];

  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Avatar'}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
    );
  }

  // Fallback with initials
  const initials = fallback?.slice(0, 2).toUpperCase() || '?';

  return (
    <div
      style={{
        width: dimension,
        height: dimension,
        borderRadius: '50%',
        backgroundColor: '#E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: dimension * 0.4,
        fontWeight: 500,
        color: '#6B7280',
      }}
    >
      {initials}
    </div>
  );
}
