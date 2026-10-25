import type { MetricStatus } from "../data/metricStatus";

type UsageBarProps = {
  label: string;
  valueLabel: string;
  widthPercent: number;
  tone: MetricStatus | "inbound" | "outbound";
};

export default function UsageBar({
  label,
  valueLabel,
  widthPercent,
  tone,
}: UsageBarProps) {
  const width = Math.min(Math.max(widthPercent, 0), 100);

  return (
    <div className="usage-block">
      <div className="usage-row">
        <span>{label}</span>
        <span className={`usage-value usage-value--${tone}`}>{valueLabel}</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(width)}
        aria-valuetext={valueLabel}
      >
        <div
          className={`progress-fill progress-fill--${tone}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
