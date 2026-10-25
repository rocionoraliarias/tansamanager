import CardHeading from "./CardHeading";
import type { TrunkSnapshot } from "../data/mockMetricsData";
import { metricStatus, statusLabel } from "../data/metricStatus";

type QosWidgetProps = {
  trunks: TrunkSnapshot[];
  warning: number;
  critical: number;
};

export default function QosWidget({ trunks, warning, critical }: QosWidgetProps) {
  const total = trunks.reduce((sum, trunk) => sum + trunk.qosMismatchCount, 0);
  const status = metricStatus(total, warning, critical);

  return (
    <section className="metrics-card" aria-labelledby="qos-title">
      <CardHeading
        title="Desajustes de QoS"
        titleId="qos-title"
        description="Ventana deslizante de 24 horas"
        badge="qos"
        icon={
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M3.5 13.5c2.2-4.8 4.2-7.2 6-7.2 2.6 0 2.8 10.4 5.2 10.4 1.6 0 3.2-2.2 5.8-6.6"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      />

      <div className="metric-total">
        <span className={`active-count active-count--${status}`}>{total}</span>
        <span className="max-count">{statusLabel(status)}</span>
      </div>

      <ul className="qos-list">
        {trunks.map((trunk) => {
          const trunkStatus = metricStatus(trunk.qosMismatchCount, warning, critical);

          return (
            <li key={trunk.id} className="qos-row">
              <span>{trunk.name}</span>
              <span className={`usage-value usage-value--${trunkStatus}`}>
                {trunk.qosMismatchCount}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="capacity-note">
        Aviso por encima de {warning} · crítico por encima de {critical}
      </p>
    </section>
  );
}
