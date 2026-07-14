/** Format tenure from an ISO date (YYYY-MM-DD) to a human duration. */
export function formatMembershipDuration(joinDate: string, asOf: Date = new Date()): string {
  if (!joinDate) return '—';

  const start = new Date(`${joinDate}T12:00:00`);
  if (Number.isNaN(start.getTime())) return '—';

  let years = asOf.getFullYear() - start.getFullYear();
  let months = asOf.getMonth() - start.getMonth();
  let days = asOf.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return '0 days';

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}mo`);
  if (parts.length === 0) {
    if (days <= 0) return 'Today';
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  if (years === 0 && months > 0 && days > 0) {
    parts.push(`${days}d`);
  }
  return parts.join(' ');
}

export function formatJoinDate(joinDate: string): string {
  if (!joinDate) return '—';
  const d = new Date(`${joinDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
