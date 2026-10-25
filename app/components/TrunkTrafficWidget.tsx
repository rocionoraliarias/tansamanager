import CardHeading from "./CardHeading";
import UsageBar from "./UsageBar";
import type { TrunkSnapshot } from "../data/mockMetricsData";

type TrunkTrafficWidgetProps = {
  trunks: TrunkSnapshot[];
};

export default function TrunkTrafficWidget({ trunks }: TrunkTrafficWidgetProps) {
  const peak = Math.max(
    1,
    ...trunks.flatMap((trunk) => [
      trunk.inboundCallCount,
      trunk.outboundCallCount,
    ]),
  );

  return (
    <section className="metrics-card" aria-labelledby="trunks-title">
      <CardHeading
        title="Tráfico de trunks"
        titleId="trunks-title"
        description="Llamadas entrantes y salientes"
        badge="trunks"
        icon={
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M5 7h11M13 4l3 3-3 3M19 17H8M11 14l-3 3 3 3"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      />

      <ul className="entity-list">
        {trunks.map((trunk) => (
          <li key={trunk.id} className="entity-block">
            <h3 className="entity-name">{trunk.name}</h3>
            <div className="metric-stack">
              <UsageBar
                label="Entrantes"
                valueLabel={String(trunk.inboundCallCount)}
                widthPercent={(trunk.inboundCallCount / peak) * 100}
                tone="inbound"
              />
              <UsageBar
                label="Salientes"
                valueLabel={String(trunk.outboundCallCount)}
                widthPercent={(trunk.outboundCallCount / peak) * 100}
                tone="outbound"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
