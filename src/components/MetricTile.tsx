import type { MetricTrend } from '../lib/portfolioMetrics';

interface Props {
  label: string;
  value: string;
  description: string;
  trend: MetricTrend;
  valueClassName?: string;
}

export function MetricTile({ label, value, description, trend, valueClassName }: Props) {
  const trendClass =
    trend.delta === 0
      ? 'metric-tile__trend--neutral'
      : trend.isPositive
        ? 'metric-tile__trend--positive'
        : 'metric-tile__trend--negative';

  return (
    <div className="metric-tile">
      <p className="metric-tile__label">{label}</p>
      <div className="metric-tile__row">
        <p className={`metric-tile__value ${valueClassName ?? ''}`}>{value}</p>
        <span className={`metric-tile__trend ${trendClass}`} title="Change vs prior 45-day cohort">
          {trend.label}
        </span>
      </div>
      <p className="metric-tile__desc">{description}</p>
    </div>
  );
}
