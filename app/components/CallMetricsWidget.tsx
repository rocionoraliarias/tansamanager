import CardHeading from "./CardHeading";
import UsageBar from "./UsageBar";
import type { CallMetrics } from "../data/mockMetricsData";
import { metricStatus, statusLabel, utilizationOf } from "../data/metricStatus";

type CallMetricsWidgetProps = {
  metrics: CallMetrics;
  warning: number;
  critical: number;
};

export default function CallMetricsWidget({
  metrics,
  warning,
  critical,
}: CallMetricsWidgetProps) {
  const { activeCallsCount, maxActiveCalls, metricType } = metrics;
  const utilization = utilizationOf(activeCallsCount, maxActiveCalls);
  const status = metricStatus(utilization, warning, critical);
  const available = Math.max(maxActiveCalls - activeCallsCount, 0);

  return (
    <section className="metrics-card" aria-labelledby="calls-title">
      <CardHeading
        title="Llamadas concurrentes"
        titleId="calls-title"
        description="Capacidad activa de la plataforma"
        badge={metricType}
        icon={
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M7.2 3.8 9.1 7.5 7.4 9.2a15.4 15.4 0 0 0 7.4 7.4l1.7-1.7 3.7 1.9-.5 3.2a1.5 1.5 0 0 1-1.7 1.2A18.7 18.7 0 0 1 2.8 5.8 1.5 1.5 0 0 1 4 4.1l3.2-.3Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 4a6 6 0 0 1 6 6M14 7a3 3 0 0 1 3 3"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        }
      />

      <div className="metric-total">
        <span className="active-count">{activeCallsCount}</span>
        <span className="max-count">
          <span aria-hidden="true">/</span> {maxActiveCalls} máx.
        </span>
      </div>

      <UsageBar
        label="Uso de capacidad"
        valueLabel={`${utilization.toFixed(1)}% · ${statusLabel(status)}`}
        widthPercent={utilization}
        tone={status}
      />

      <div className="capacity-note">
        <span className={`status-dot status-dot--${status}`} aria-hidden="true" />
        <span>{available} llamadas disponibles</span>
      </div>
    </section>
  );
}
