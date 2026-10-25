import type { ReactNode } from "react";
import CardHeading from "./CardHeading";
import UsageBar from "./UsageBar";
import { formatRequests } from "../data/usageMetrics";

type UsageRow = {
  id: string;
  label: string;
  value: number;
};

type UsageBreakdownWidgetProps = {
  title: string;
  titleId: string;
  description: string;
  badge: string;
  icon: ReactNode;
  rows: UsageRow[];
};

export default function UsageBreakdownWidget({
  title,
  titleId,
  description,
  badge,
  icon,
  rows,
}: UsageBreakdownWidgetProps) {
  const peak = Math.max(1, ...rows.map((row) => row.value));

  return (
    <section className="metrics-card" aria-labelledby={titleId}>
      <CardHeading
        title={title}
        titleId={titleId}
        description={description}
        badge={badge}
        icon={icon}
      />

      <ul className="entity-list">
        {rows.map((row) => (
          <li key={row.id}>
            <UsageBar
              label={row.label}
              valueLabel={formatRequests(row.value)}
              widthPercent={(row.value / peak) * 100}
              tone="inbound"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
