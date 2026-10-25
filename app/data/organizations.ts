import {
  mockEdges,
  mockMetricsData,
  mockTrunks,
  type CallMetrics,
  type EdgeSnapshot,
  type TrunkSnapshot,
} from "./mockMetricsData";

export type OrganizationEnvironment = "development" | "staging" | "production";

export type OrganizationSummary = {
  id: string;
  name: string;
  environment: OrganizationEnvironment;
};

export type OrganizationDashboard = OrganizationSummary & {
  connector: "genesys";
  updatedAt: string;
  calls: CallMetrics;
  edges: EdgeSnapshot[];
  trunks: TrunkSnapshot[];
};

const updatedAt = "2026-10-25T19:30:00.000Z";

function seriesEnding(end: number, startRatio: number): number[] {
  const series = Array.from({ length: 8 }, (_, index) => {
    const progress = index / 7;
    const value = end * (startRatio + (1 - startRatio) * progress);
    return Math.round(value * 10) / 10;
  });
  series[series.length - 1] = end;
  return series;
}

function edgeWith(
  base: EdgeSnapshot,
  values: Pick<EdgeSnapshot, "cpuPct" | "memoryPct" | "diskPct" | "networkPct">,
): EdgeSnapshot {
  return {
    ...base,
    ...values,
    history: {
      cpuPct: seriesEnding(values.cpuPct, 0.72),
      memoryPct: seriesEnding(values.memoryPct, 0.84),
      diskPct: seriesEnding(values.diskPct, 0.9),
      networkPct: seriesEnding(values.networkPct, 0.55),
    },
  };
}

function trunkWith(
  base: TrunkSnapshot,
  values: Pick<
    TrunkSnapshot,
    "inboundCallCount" | "outboundCallCount" | "qosMismatchCount"
  >,
): TrunkSnapshot {
  return {
    ...base,
    ...values,
    history: {
      inboundCallCount: seriesEnding(values.inboundCallCount, 0.62),
      outboundCallCount: seriesEnding(values.outboundCallCount, 0.7),
      qosMismatchCount: seriesEnding(values.qosMismatchCount, 0.3),
    },
  };
}

const clientName = "Banca privada S.R.L";

const organizations = [
  {
    id: "development",
    name: clientName,
    connector: "genesys",
    environment: "development",
    updatedAt,
    calls: mockMetricsData,
    edges: mockEdges,
    trunks: mockTrunks,
  },
  {
    id: "staging",
    name: clientName,
    connector: "genesys",
    environment: "staging",
    updatedAt,
    calls: { activeCallsCount: 168, maxActiveCalls: 250, metricType: "cloud" },
    edges: [
      edgeWith(mockEdges[0], { cpuPct: 66, memoryPct: 71, diskPct: 58, networkPct: 49 }),
      edgeWith(mockEdges[1], { cpuPct: 81, memoryPct: 77, diskPct: 74, networkPct: 63 }),
      edgeWith(mockEdges[2], { cpuPct: 44, memoryPct: 52, diskPct: 39, networkPct: 28 }),
    ],
    trunks: [
      trunkWith(mockTrunks[0], {
        inboundCallCount: 46,
        outboundCallCount: 33,
        qosMismatchCount: 3,
      }),
      trunkWith(mockTrunks[1], {
        inboundCallCount: 62,
        outboundCallCount: 41,
        qosMismatchCount: 9,
      }),
      trunkWith(mockTrunks[2], {
        inboundCallCount: 24,
        outboundCallCount: 29,
        qosMismatchCount: 2,
      }),
    ],
  },
  {
    id: "production",
    name: clientName,
    connector: "genesys",
    environment: "production",
    updatedAt,
    calls: { activeCallsCount: 214, maxActiveCalls: 250, metricType: "cloud" },
    edges: [
      edgeWith(mockEdges[0], { cpuPct: 84, memoryPct: 79, diskPct: 88, networkPct: 71 }),
      edgeWith(mockEdges[1], { cpuPct: 91, memoryPct: 86, diskPct: 83, networkPct: 77 }),
      edgeWith(mockEdges[2], { cpuPct: 68, memoryPct: 74, diskPct: 61, networkPct: 54 }),
    ],
    trunks: [
      trunkWith(mockTrunks[0], {
        inboundCallCount: 74,
        outboundCallCount: 51,
        qosMismatchCount: 7,
      }),
      trunkWith(mockTrunks[1], {
        inboundCallCount: 88,
        outboundCallCount: 63,
        qosMismatchCount: 14,
      }),
      trunkWith(mockTrunks[2], {
        inboundCallCount: 41,
        outboundCallCount: 36,
        qosMismatchCount: 5,
      }),
    ],
  },
] satisfies OrganizationDashboard[];

export function listOrganizations(): OrganizationSummary[] {
  return organizations.map(({ id, name, environment }) => ({
    id,
    name,
    environment,
  }));
}

export function getOrganization(
  id: string | null,
): OrganizationDashboard | undefined {
  if (!id) return organizations[0];
  return organizations.find((organization) => organization.id === id);
}

export function environmentLabel(environment: OrganizationEnvironment): string {
  if (environment === "production") return "Producción";
  if (environment === "staging") return "Staging";
  return "Development";
}

export function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso));
}
