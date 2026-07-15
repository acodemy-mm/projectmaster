import type { TimelineFilterState, TimelineFilterMode } from '../lib/timelineFilter';
import { buildMonthOptions } from '../lib/timelineFilter';

interface Props {
  value: TimelineFilterState;
  onChange: (next: TimelineFilterState) => void;
  /** Used to populate month dropdown options from project dates */
  projects?: { startDate: string; dueDate: string }[];
}

const MODES: { value: TimelineFilterMode; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'month', label: 'By month' },
  { value: 'range', label: 'Date range' },
];

export function TimelineFilter({ value, onChange, projects = [] }: Props) {
  const monthOptions = buildMonthOptions(projects);
  if (!monthOptions.includes(value.month)) {
    monthOptions.unshift(value.month);
  }

  return (
    <div className="toolbar-filters timeline-filter" role="group" aria-label="Filter by timeline">
      <div className="toolbar-filter">
        <select
          className="toolbar-filter__select"
          value={value.mode}
          onChange={(e) =>
            onChange({ ...value, mode: e.target.value as TimelineFilterMode })
          }
          aria-label="Timeline filter mode"
        >
          {MODES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {value.mode === 'month' && (
        <div className="toolbar-filter">
          <select
            className="toolbar-filter__select"
            value={value.month}
            onChange={(e) => onChange({ ...value, month: e.target.value })}
            aria-label="Filter by month"
          >
            {monthOptions.map((ym) => {
              const [y, m] = ym.split('-').map(Number);
              const label = new Date(y, m - 1, 1).toLocaleString('en-US', {
                month: 'short',
                year: 'numeric',
              });
              return (
                <option key={ym} value={ym}>{label}</option>
              );
            })}
          </select>
        </div>
      )}

      {value.mode === 'range' && (
        <>
          <div className="toolbar-filter">
            <input
              type="date"
              className="toolbar-filter__select toolbar-filter__date"
              value={value.from}
              onChange={(e) => onChange({ ...value, from: e.target.value })}
              aria-label="Timeline from date"
            />
          </div>
          <span className="timeline-filter__sep" aria-hidden>to</span>
          <div className="toolbar-filter">
            <input
              type="date"
              className="toolbar-filter__select toolbar-filter__date"
              value={value.to}
              onChange={(e) => onChange({ ...value, to: e.target.value })}
              aria-label="Timeline to date"
            />
          </div>
        </>
      )}
    </div>
  );
}
