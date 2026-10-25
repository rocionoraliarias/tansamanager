export type MetricStatus = "healthy" | "warning" | "critical";

export const usageWarning = 60;
export const usageCritical = 80;

export function metricStatus(
  value: number,
  warning: number,
  critical: number,
): MetricStatus {
  if (value > critical) return "critical";
  if (value > warning) return "warning";
  return "healthy";
}

export function statusLabel(status: MetricStatus) {
  if (status === "critical") return "Crítico";
  if (status === "warning") return "Aviso";
  return "Estable";
}

export function serviceLevelStatus(percent: number): MetricStatus {
  if (percent < 70) return "critical";
  if (percent < 80) return "warning";
  return "healthy";
}

export function utilizationOf(active: number, max: number): number {
  if (max <= 0) return 0;
  return Number(((active / max) * 100).toFixed(1));
}
