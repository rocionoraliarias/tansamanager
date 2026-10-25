import CardHeading from "./CardHeading";
import { alertStatus, type AlertRule } from "../data/alertRules";
import type { AgentActivity } from "../data/analyticsMetrics";
import { statusLabel } from "../data/metricStatus";

type AgentSnapshotWidgetProps = {
  agents: AgentActivity;
  waiting: number;
  rule: AlertRule;
};

export default function AgentSnapshotWidget({
  agents,
  waiting,
  rule,
}: AgentSnapshotWidgetProps) {
  const status = alertStatus(agents.available, rule);

  return (
    <section className="metrics-card" aria-labelledby="agents-title">
      <CardHeading
        title="Agentes"
        titleId="agents-title"
        description="Dotación en cola ahora"
        badge="equipo"
        icon={
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
            <path
              d="M6.2 19.2c.7-3 2.7-4.5 5.8-4.5s5.1 1.5 5.8 4.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        }
      />

      <div className="metric-total">
        <span className={`active-count active-count--${status}`}>{agents.available}</span>
        <span className="max-count">disponibles</span>
      </div>

      <ul className="stat-grid">
        <li>
          <span>En cola</span>
          <strong>{agents.onQueue}</strong>
        </li>
        <li>
          <span>En llamada</span>
          <strong>{agents.interacting}</strong>
        </li>
        <li>
          <span>En espera</span>
          <strong>{waiting}</strong>
        </li>
        <li>
          <span>Alerta</span>
          <strong className={`usage-value usage-value--${status}`}>{statusLabel(status)}</strong>
        </li>
      </ul>
    </section>
  );
}
