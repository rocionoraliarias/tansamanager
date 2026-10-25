import CardHeading from "./CardHeading";
import UsageBar from "./UsageBar";
import {
  edgeMetricOptions,
  formatMetricValue,
  type EdgeSnapshot,
} from "../data/mockMetricsData";
import { ruleById, type AlertRule, type AlertRuleId } from "../data/alertRules";
import { metricStatus } from "../data/metricStatus";

const edgeRuleIds = {
  cpuPct: "edgeCpu",
  memoryPct: "edgeMemory",
  diskPct: "edgeDisk",
  networkPct: "edgeNetwork",
} as const satisfies Record<string, AlertRuleId>;

type EdgeHealthWidgetProps = {
  edges: EdgeSnapshot[];
  rules: AlertRule[];
};

export default function EdgeHealthWidget({ edges, rules }: EdgeHealthWidgetProps) {
  return (
    <section className="metrics-card" aria-labelledby="edges-title">
      <CardHeading
        title="Salud de edges"
        titleId="edges-title"
        description="CPU, memoria, disco y red"
        badge="edges"
        icon={
          <svg viewBox="0 0 24 24" fill="none">
            <rect
              x="3.5"
              y="4"
              width="17"
              height="6.5"
              rx="1.6"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <rect
              x="3.5"
              y="13.5"
              width="17"
              height="6.5"
              rx="1.6"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="M7 7.2h.01M7 16.7h.01"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        }
      />

      <ul className="entity-list">
        {edges.map((edge) => (
          <li key={edge.id} className="entity-block">
            <h3 className="entity-name">{edge.name}</h3>
            <div className="metric-grid">
              {edgeMetricOptions.map((option) => {
                const value = edge[option.id];
                const rule = ruleById(rules, edgeRuleIds[option.id]);
                return (
                  <UsageBar
                    key={option.id}
                    label={option.label}
                    valueLabel={`${formatMetricValue(value, option.unit)}%`}
                    widthPercent={value}
                    tone={metricStatus(value, rule.warning, rule.critical)}
                  />
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
