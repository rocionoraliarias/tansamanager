import CardHeading from "./CardHeading";
import { alertStatus, type AlertRule } from "../data/alertRules";
import type { ServiceLevelPoint } from "../data/analyticsMetrics";
import { statusLabel } from "../data/metricStatus";

type ServiceLevelWidgetProps = {
  points: ServiceLevelPoint[];
  rule: AlertRule;
};

export default function ServiceLevelWidget({ points, rule }: ServiceLevelWidgetProps) {
  const latest = points.at(-1)?.percent ?? 0;
  const status = alertStatus(latest, rule);

  return (
    <section className="metrics-card" aria-labelledby="service-level-title">
      <CardHeading
        title="Nivel de servicio"
        titleId="service-level-title"
        description="Últimas horas de la operación"
        badge="8 h"
        icon={
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M4 16.5 9 11l3.2 3.2L20 7"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      />

      <div className="metric-total">
        <span className={`active-count active-count--${status}`}>{latest.toFixed(1)}%</span>
        <span className="max-count">{statusLabel(status)}</span>
      </div>

      <div className="trend-chart" role="list" aria-label="Nivel de servicio por hora">
        {points.map((point) => {
          const pointStatus = alertStatus(point.percent, rule);
          const height = Math.min(Math.max(point.percent, 0), 100);
          return (
            <div className="trend-column" key={point.label} role="listitem">
              <div className="trend-bar-slot">
                <div
                  className={`trend-bar progress-fill--${pointStatus}`}
                  style={{ height: `${height}%` }}
                  title={`${point.label}h · ${point.percent.toFixed(1)}%`}
                />
              </div>
              <span className="trend-label">{point.label}h</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
