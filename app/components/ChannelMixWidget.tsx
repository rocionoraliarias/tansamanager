import CardHeading from "./CardHeading";
import UsageBar from "./UsageBar";
import type { ChannelVolume } from "../data/analyticsMetrics";

type ChannelMixWidgetProps = {
  channels: ChannelVolume[];
};

export default function ChannelMixWidget({ channels }: ChannelMixWidgetProps) {
  return (
    <section className="metrics-card" aria-labelledby="channels-title">
      <CardHeading
        title="Conversaciones por canal"
        titleId="channels-title"
        description="Ofrecidas, atendidas y abandonadas"
        badge="hoy"
        icon={
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M5 16V11M10 16V7M15 16v-5M19 16V8"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        }
      />

      <ul className="entity-list">
        {channels.map((channel) => {
          const rate = channel.offered > 0 ? (channel.answered / channel.offered) * 100 : 0;
          return (
            <li key={channel.id} className="entity-block">
              <h3 className="entity-name">{channel.label}</h3>
              <UsageBar
                label={`${channel.answered} atendidas · ${channel.abandoned} abandonadas`}
                valueLabel={`${channel.offered} ofrecidas`}
                widthPercent={rate}
                tone="inbound"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
