import CardHeading from "./CardHeading";
import UsageBar from "./UsageBar";
import { alertStatus, type AlertRule } from "../data/alertRules";
import type { QueueLive } from "../data/analyticsMetrics";

type QueueLiveWidgetProps = {
  queues: QueueLive[];
  serviceLevel: AlertRule;
  waitingRule: AlertRule;
};

export default function QueueLiveWidget({
  queues,
  serviceLevel,
  waitingRule,
}: QueueLiveWidgetProps) {
  const waiting = queues.reduce((sum, queue) => sum + queue.waiting, 0);
  const waitingStatus = alertStatus(waiting, waitingRule);

  return (
    <section className="metrics-card" aria-labelledby="queues-title">
      <CardHeading
        title="Colas en vivo"
        titleId="queues-title"
        description="Espera y nivel de servicio"
        badge="colas"
        icon={
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M5 7h14M5 12h14M5 17h9"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        }
      />

      <div className="metric-total">
        <span className={`active-count active-count--${waitingStatus}`}>{waiting}</span>
        <span className="max-count">en espera</span>
      </div>

      <ul className="entity-list">
        {queues.map((queue) => {
          const status = alertStatus(queue.serviceLevelPercent, serviceLevel);
          return (
            <li key={queue.id} className="entity-block">
              <h3 className="entity-name">{queue.name}</h3>
              <UsageBar
                label={`${queue.waiting} en espera · ${queue.interacting} en llamada`}
                valueLabel={`${queue.serviceLevelPercent.toFixed(1)}%`}
                widthPercent={queue.serviceLevelPercent}
                tone={status}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
