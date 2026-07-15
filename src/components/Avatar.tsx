import { useEffect, useState } from 'react';

interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
  title?: string;
  /** Supabase Storage public URL (or empty for initials fallback) */
  src?: string;
}

export function Avatar({ initials, color, size = 28, title, src }: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    setImgFailed(false);
  }, [src]);
  const hasImage = Boolean(src?.trim()) && !imgFailed;

  return (
    <span
      className={`mac-avatar${hasImage ? ' mac-avatar--image' : ''}`}
      title={title ?? initials}
      style={{
        width: size,
        height: size,
        background: hasImage ? 'var(--mac-bg-control)' : color,
        fontSize: size * 0.36,
        ...(hasImage ? { borderColor: color } : null),
      }}
    >
      {hasImage ? (
        <img
          src={src}
          alt={title ?? initials}
          className="mac-avatar__img"
          onError={() => setImgFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}

interface AvatarGroupProps {
  assignees: { name: string; initials: string; avatarColor: string; avatarUrl?: string }[];
  size?: number;
}

export function AvatarGroup({ assignees, size = 24 }: AvatarGroupProps) {
  return (
    <div className="avatar-group">
      {assignees.map((a, i) => (
        <Avatar
          key={i}
          initials={a.initials}
          color={a.avatarColor}
          src={a.avatarUrl}
          size={size}
          title={a.name}
        />
      ))}
    </div>
  );
}
