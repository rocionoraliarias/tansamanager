export type QueueLive = {
  id: string;
  name: string;
  waiting: number;
  interacting: number;
  serviceLevelPercent: number;
};

export type ChannelVolume = {
  id: string;
  label: string;
  offered: number;
  answered: number;
  abandoned: number;
};

export type AgentActivity = {
  onQueue: number;
  interacting: number;
  available: number;
};

export type ServiceLevelPoint = {
  label: string;
  percent: number;
};

export type AnalyticsSnapshot = {
  queues: QueueLive[];
  channels: ChannelVolume[];
  agents: AgentActivity;
  serviceLevelByHour: ServiceLevelPoint[];
};

export function analyticsFor(organizationId: string): AnalyticsSnapshot {
  if (organizationId === "staging" || organizationId === "production") {
    return analyticsByOrganization[organizationId];
  }
  return analyticsByOrganization.development;
}

const hours = ["09", "10", "11", "12", "13", "14", "15", "16"];

function hourly(values: number[]): ServiceLevelPoint[] {
  return hours.map((label, index) => ({
    label,
    percent: values[index] ?? values[values.length - 1] ?? 0,
  }));
}

export const analyticsByOrganization = {
  development: {
    queues: [
      { id: "ventas", name: "Ventas", waiting: 2, interacting: 6, serviceLevelPercent: 94.2 },
      { id: "soporte", name: "Soporte", waiting: 1, interacting: 4, serviceLevelPercent: 91.5 },
      { id: "cobranzas", name: "Cobranzas", waiting: 0, interacting: 2, serviceLevelPercent: 97 },
    ],
    channels: [
      { id: "voice", label: "Voz", offered: 420, answered: 390, abandoned: 18 },
      { id: "chat", label: "Chat", offered: 140, answered: 128, abandoned: 6 },
      { id: "email", label: "Mail", offered: 86, answered: 70, abandoned: 4 },
      { id: "message", label: "Mensaje", offered: 54, answered: 49, abandoned: 2 },
    ],
    agents: { onQueue: 18, interacting: 12, available: 6 },
    serviceLevelByHour: hourly([96, 95, 94, 93, 95, 94, 92, 94.2]),
  },
  staging: {
    queues: [
      { id: "siniestros", name: "Siniestros", waiting: 7, interacting: 11, serviceLevelPercent: 76.4 },
      { id: "atencion", name: "Atención", waiting: 4, interacting: 9, serviceLevelPercent: 81.2 },
      { id: "cobranzas", name: "Cobranzas", waiting: 2, interacting: 5, serviceLevelPercent: 88 },
    ],
    channels: [
      { id: "voice", label: "Voz", offered: 980, answered: 760, abandoned: 94 },
      { id: "chat", label: "Chat", offered: 310, answered: 250, abandoned: 28 },
      { id: "email", label: "Mail", offered: 220, answered: 150, abandoned: 18 },
      { id: "message", label: "Mensaje", offered: 140, answered: 112, abandoned: 9 },
    ],
    agents: { onQueue: 42, interacting: 36, available: 6 },
    serviceLevelByHour: hourly([86, 84, 81, 79, 77, 78, 76, 78.4]),
  },
  production: {
    queues: [
      { id: "general", name: "General", waiting: 16, interacting: 22, serviceLevelPercent: 58.6 },
      { id: "prioridad", name: "Prioridad", waiting: 8, interacting: 14, serviceLevelPercent: 66.1 },
      { id: "reclamos", name: "Reclamos", waiting: 5, interacting: 9, serviceLevelPercent: 71.4 },
    ],
    channels: [
      { id: "voice", label: "Voz", offered: 1640, answered: 980, abandoned: 240 },
      { id: "chat", label: "Chat", offered: 520, answered: 300, abandoned: 70 },
      { id: "email", label: "Mail", offered: 410, answered: 190, abandoned: 36 },
      { id: "message", label: "Mensaje", offered: 260, answered: 150, abandoned: 22 },
    ],
    agents: { onQueue: 48, interacting: 47, available: 1 },
    serviceLevelByHour: hourly([74, 71, 68, 66, 63, 62, 60, 61.5]),
  },
} satisfies Record<string, AnalyticsSnapshot>;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function jitterCount(value: number, ceiling: number) {
  return clamp(value + Math.round((Math.random() - 0.45) * 6), 0, ceiling);
}

function jitterPercent(value: number) {
  const next = value + (Math.random() - 0.5) * 8;
  return Math.round(clamp(next, 0, 100) * 10) / 10;
}

export function headlineServiceLevel(snapshot: AnalyticsSnapshot) {
  return snapshot.serviceLevelByHour.at(-1)?.percent ?? 0;
}

export function simulateAnalytics(current: AnalyticsSnapshot): AnalyticsSnapshot {
  const queues = current.queues.map((queue) => ({
    ...queue,
    waiting: jitterCount(queue.waiting, 40),
    interacting: jitterCount(queue.interacting, 40),
    serviceLevelPercent: jitterPercent(queue.serviceLevelPercent),
  }));
  const channels = current.channels.map((channel) => {
    const offered = jitterCount(channel.offered, 4000);
    const answered = clamp(jitterCount(channel.answered, offered), 0, offered);
    const abandoned = clamp(
      jitterCount(channel.abandoned, offered - answered),
      0,
      offered - answered,
    );
    return { ...channel, offered, answered, abandoned };
  });
  const onQueue = current.agents.onQueue;
  const interacting = clamp(jitterCount(current.agents.interacting, onQueue), 0, onQueue);
  const serviceLevelPercent = jitterPercent(headlineServiceLevel(current));
  const previous = current.serviceLevelByHour.slice(1);
  const lastLabel = current.serviceLevelByHour.at(-1)?.label ?? "16";
  const hour = Number.parseInt(lastLabel, 10);
  const nextLabel = Number.isInteger(hour)
    ? String((hour + 1) % 24).padStart(2, "0")
    : lastLabel;

  return {
    queues,
    channels,
    agents: { onQueue, interacting, available: onQueue - interacting },
    serviceLevelByHour: [
      ...previous,
      { label: nextLabel, percent: serviceLevelPercent },
    ],
  };
}
