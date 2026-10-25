export type CallMetrics = {
  activeCallsCount: number;
  maxActiveCalls: number;
  metricType: string;
  utilizationPercentage: number;
};

export const mockMetricsData = {
  activeCallsCount: 42,
  maxActiveCalls: 250,
  metricType: "cloud",
  utilizationPercentage: 16.8,
} satisfies CallMetrics;
