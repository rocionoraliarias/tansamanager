import type { AnalyticsSnapshot } from "./analyticsMetrics";
import {
  alertStatus,
  type AlertRule,
  type AlertRuleId,
} from "./alertRules";
import type { JourneyId } from "./journeys";
import {
  formatMetricValue,
  type CallMetrics,
  type EdgeSnapshot,
  type TrunkSnapshot,
} from "./mockMetricsData";
import { utilizationOf, type MetricStatus } from "./metricStatus";
import { formatRequests, totalRequests, type UsageSnapshot } from "./usageMetrics";

export type OperationsReading = {
  calls: CallMetrics;
  edges: EdgeSnapshot[];
  trunks: TrunkSnapshot[];
  analytics: AnalyticsSnapshot;
  usage: UsageSnapshot;
};

export type AlertSample = {
  rule: AlertRule;
  value: number;
  valueLabel: string;
  status: MetricStatus;
};

export type ActiveAlert = AlertSample & {
  status: "warning" | "critical";
};

export type AlertCrossing = {
  id: string;
  at: string;
  label: string;
  valueLabel: string;
  status: MetricStatus;
  journey: JourneyId;
};

const crossingLimit = 8;

function worst(values: number[]) {
  return values.reduce((max, value) => Math.max(max, value), 0);
}

function headlineValue(ruleId: AlertRuleId, reading: OperationsReading) {
  switch (ruleId) {
    case "callUtilization":
      return utilizationOf(
        reading.calls.activeCallsCount,
        reading.calls.maxActiveCalls,
      );
    case "edgeCpu":
      return worst(reading.edges.map((edge) => edge.cpuPct));
    case "edgeMemory":
      return worst(reading.edges.map((edge) => edge.memoryPct));
    case "edgeDisk":
      return worst(reading.edges.map((edge) => edge.diskPct));
    case "edgeNetwork":
      return worst(reading.edges.map((edge) => edge.networkPct));
    case "qosMismatches":
      return reading.trunks.reduce((sum, trunk) => sum + trunk.qosMismatchCount, 0);
    case "serviceLevel":
      return reading.analytics.serviceLevelByHour.at(-1)?.percent ?? 0;
    case "queueWaiting":
      return reading.analytics.queues.reduce((sum, queue) => sum + queue.waiting, 0);
    case "agentsAvailable":
      return reading.analytics.agents.available;
    case "apiRequests":
      return totalRequests(reading.usage);
  }
}

function formatAlertValue(rule: AlertRule, value: number) {
  if (rule.unit === "%") return `${formatMetricValue(value, "%")}%`;
  if (rule.unit === "solicitudes") return formatRequests(value);
  if (rule.unit === "desajustes") return formatMetricValue(value, "desajustes");
  return String(Math.round(value));
}

export function readAlerts(rules: AlertRule[], reading: OperationsReading): AlertSample[] {
  return rules.map((rule) => {
    const value = headlineValue(rule.id, reading);
    return {
      rule,
      value,
      valueLabel: formatAlertValue(rule, value),
      status: alertStatus(value, rule),
    };
  });
}

export function activeAlerts(rules: AlertRule[], reading: OperationsReading): ActiveAlert[] {
  return readAlerts(rules, reading).filter(
    (sample): sample is ActiveAlert => sample.status !== "healthy",
  );
}

export function alertCrossings(
  before: AlertSample[],
  after: AlertSample[],
  at: string,
  journey: JourneyId,
): AlertCrossing[] {
  return after.flatMap((sample) => {
    if (sample.rule.journey !== journey) return [];
    const previous = before.find((item) => item.rule.id === sample.rule.id);
    if (!previous || previous.status === sample.status) return [];
    return [
      {
        id: `${sample.rule.id}-${at}`,
        at,
        label: sample.rule.label,
        valueLabel: sample.valueLabel,
        status: sample.status,
        journey,
      },
    ];
  });
}

export function pushCrossings(current: AlertCrossing[], fresh: AlertCrossing[]) {
  return [...fresh, ...current].slice(0, crossingLimit);
}
