import CardHeading from "./CardHeading";
import { alertStatus, type AlertRule } from "../data/alertRules";
import { formatRequests } from "../data/usageMetrics";
import { statusLabel } from "../data/metricStatus";

type ApiUsageWidgetProps = {
  total: number;
  rule: AlertRule;
};

export default function ApiUsageWidget({ total, rule }: ApiUsageWidgetProps) {
  const status = alertStatus(total, rule);
  return (
    <section className="metrics-card" aria-labelledby="api-usage-title">
      <CardHeading
        title="Solicitudes a la API"
        titleId="api-usage-title"
        description="Actividad de las últimas 24 horas"
        badge="api"
        icon={
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M8 8 4.5 12 8 16M16 8l3.5 4-3.5 4M13.5 6l-3 12"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      />

      <div className="metric-total">
        <span className={`active-count active-count--compact active-count--${status}`}>
          {formatRequests(total)}
        </span>
        <span className="max-count">{statusLabel(status)}</span>
      </div>
      <p className="capacity-note">
        Suma de los clientes OAuth. Este número no dice qué es facturable.
      </p>
    </section>
  );
}
