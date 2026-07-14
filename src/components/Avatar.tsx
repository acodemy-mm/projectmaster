interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
  title?: string;
}

export function Avatar({ initials, color, size = 28, title }: AvatarProps) {
  return (
    <span
      className="mac-avatar"
      title={title ?? initials}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </span>
  );
}

interface AvatarGroupProps {
  assignees: { name: string; initials: string; avatarColor: string }[];
  size?: number;
}

export function AvatarGroup({ assignees, size = 24 }: AvatarGroupProps) {
  return (
    <div className="avatar-group">
      {assignees.map((a, i) => (
        <Avatar key={i} initials={a.initials} color={a.avatarColor} size={size} title={a.name} />
      ))}
    </div>
  );
}
