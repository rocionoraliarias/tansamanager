export type CallMetrics = {
  activeCallsCount: number;
  maxActiveCalls: number;
  metricType: string;
};

export type EdgeMetricId = "cpuPct" | "memoryPct" | "diskPct" | "networkPct";

export type TrunkMetricId =
  | "inboundCallCount"
  | "outboundCallCount"
  | "qosMismatchCount";

export type MetricOption = {
  id: EdgeMetricId | TrunkMetricId;
  label: string;
  unit: "%" | "llamadas" | "desajustes";
  warning: number;
  critical: number;
  scale: number;
};

export type EdgeSnapshot = {
  id: string;
  name: string;
  cpuPct: number;
  memoryPct: number;
  diskPct: number;
  networkPct: number;
  history: Record<EdgeMetricId, number[]>;
};

export type TrunkSnapshot = {
  id: string;
  name: string;
  inboundCallCount: number;
  outboundCallCount: number;
  qosMismatchCount: number;
  history: Record<TrunkMetricId, number[]>;
};

export const edgeMetricOptions = [
  {
    id: "cpuPct",
    label: "CPU",
    unit: "%",
    warning: 60,
    critical: 80,
    scale: 100,
  },
  {
    id: "memoryPct",
    label: "Memoria",
    unit: "%",
    warning: 60,
    critical: 80,
    scale: 100,
  },
  {
    id: "diskPct",
    label: "Disco",
    unit: "%",
    warning: 70,
    critical: 85,
    scale: 100,
  },
  {
    id: "networkPct",
    label: "Red",
    unit: "%",
    warning: 60,
    critical: 80,
    scale: 100,
  },
] as const satisfies readonly MetricOption[];

export const trunkMetricOptions = [
  {
    id: "inboundCallCount",
    label: "Llamadas entrantes",
    unit: "llamadas",
    warning: 40,
    critical: 70,
    scale: 100,
  },
  {
    id: "outboundCallCount",
    label: "Llamadas salientes",
    unit: "llamadas",
    warning: 40,
    critical: 70,
    scale: 100,
  },
  {
    id: "qosMismatchCount",
    label: "Desajustes de QoS",
    unit: "desajustes",
    warning: 4,
    critical: 8,
    scale: 20,
  },
] as const satisfies readonly MetricOption[];

export const mockMetricsData = {
  activeCallsCount: 42,
  maxActiveCalls: 250,
  metricType: "cloud",
} satisfies CallMetrics;

export const mockEdges = [
  {
    id: "edge-bue",
    name: "Edge Buenos Aires",
    cpuPct: 34,
    memoryPct: 48,
    diskPct: 41,
    networkPct: 22,
    history: {
      cpuPct: [28, 31, 29, 36, 33, 38, 35, 34],
      memoryPct: [44, 45, 47, 46, 49, 50, 48, 48],
      diskPct: [39, 39, 40, 40, 41, 41, 41, 41],
      networkPct: [16, 18, 21, 19, 24, 27, 23, 22],
    },
  },
  {
    id: "edge-cor",
    name: "Edge Córdoba",
    cpuPct: 72,
    memoryPct: 64,
    diskPct: 55,
    networkPct: 38,
    history: {
      cpuPct: [58, 61, 66, 63, 69, 74, 71, 72],
      memoryPct: [57, 59, 60, 62, 63, 65, 64, 64],
      diskPct: [51, 52, 52, 53, 54, 54, 55, 55],
      networkPct: [29, 31, 34, 33, 36, 40, 37, 38],
    },
  },
  {
    id: "edge-cloud",
    name: "Edge Cloud",
    cpuPct: 18,
    memoryPct: 31,
    diskPct: 27,
    networkPct: 14,
    history: {
      cpuPct: [14, 16, 15, 19, 17, 21, 18, 18],
      memoryPct: [28, 29, 30, 30, 32, 33, 31, 31],
      diskPct: [26, 26, 26, 27, 27, 27, 27, 27],
      networkPct: [9, 11, 10, 13, 12, 16, 15, 14],
    },
  },
] satisfies EdgeSnapshot[];

export const mockTrunks = [
  {
    id: "trunk-claro",
    name: "SIP Claro",
    inboundCallCount: 18,
    outboundCallCount: 11,
    qosMismatchCount: 1,
    history: {
      inboundCallCount: [12, 14, 16, 15, 19, 21, 17, 18],
      outboundCallCount: [8, 9, 10, 12, 11, 13, 12, 11],
      qosMismatchCount: [0, 0, 1, 1, 2, 1, 1, 1],
    },
  },
  {
    id: "trunk-movistar",
    name: "SIP Movistar",
    inboundCallCount: 27,
    outboundCallCount: 19,
    qosMismatchCount: 6,
    history: {
      inboundCallCount: [20, 22, 24, 23, 28, 31, 26, 27],
      outboundCallCount: [14, 15, 16, 18, 17, 21, 20, 19],
      qosMismatchCount: [2, 3, 3, 4, 5, 7, 6, 6],
    },
  },
  {
    id: "trunk-byoc",
    name: "BYOC Principal",
    inboundCallCount: 9,
    outboundCallCount: 14,
    qosMismatchCount: 0,
    history: {
      inboundCallCount: [6, 7, 8, 7, 10, 11, 9, 9],
      outboundCallCount: [10, 11, 12, 13, 12, 15, 14, 14],
      qosMismatchCount: [0, 1, 0, 0, 0, 1, 0, 0],
    },
  },
] satisfies TrunkSnapshot[];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function shift(series: number[], value: number) {
  return [...series.slice(-7), value];
}

function jitterPercent(value: number) {
  const next = value + (Math.random() - 0.48) * 16;
  return Math.round(clamp(next, 0, 100) * 10) / 10;
}

function jitterCount(value: number, ceiling: number) {
  const next = value + Math.round((Math.random() - 0.45) * 8);
  return clamp(next, 0, ceiling);
}

export function simulateCalls(metrics: CallMetrics): CallMetrics {
  return {
    ...metrics,
    activeCallsCount: Math.floor(Math.random() * (metrics.maxActiveCalls + 1)),
  };
}

export function simulateEdge(edge: EdgeSnapshot): EdgeSnapshot {
  const cpuPct = jitterPercent(edge.cpuPct);
  const memoryPct = jitterPercent(edge.memoryPct);
  const diskPct = jitterPercent(edge.diskPct);
  const networkPct = jitterPercent(edge.networkPct);

  return {
    ...edge,
    cpuPct,
    memoryPct,
    diskPct,
    networkPct,
    history: {
      cpuPct: shift(edge.history.cpuPct, cpuPct),
      memoryPct: shift(edge.history.memoryPct, memoryPct),
      diskPct: shift(edge.history.diskPct, diskPct),
      networkPct: shift(edge.history.networkPct, networkPct),
    },
  };
}

export function simulateTrunk(trunk: TrunkSnapshot): TrunkSnapshot {
  const inboundCallCount = jitterCount(trunk.inboundCallCount, 120);
  const outboundCallCount = jitterCount(trunk.outboundCallCount, 120);
  const qosMismatchCount = jitterCount(trunk.qosMismatchCount, 40);

  return {
    ...trunk,
    inboundCallCount,
    outboundCallCount,
    qosMismatchCount,
    history: {
      inboundCallCount: shift(trunk.history.inboundCallCount, inboundCallCount),
      outboundCallCount: shift(trunk.history.outboundCallCount, outboundCallCount),
      qosMismatchCount: shift(trunk.history.qosMismatchCount, qosMismatchCount),
    },
  };
}

export function formatMetricValue(value: number, unit: MetricOption["unit"]) {
  if (unit === "%") {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }

  return String(Math.round(value));
}
