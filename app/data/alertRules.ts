import type { JourneyId } from "./journeys";
import type { MetricStatus } from "./metricStatus";

export type AlertDirection = "above" | "below";

export type AlertRuleId =
  | "callUtilization"
  | "edgeCpu"
  | "edgeMemory"
  | "edgeDisk"
  | "edgeNetwork"
  | "qosMismatches"
  | "serviceLevel"
  | "queueWaiting"
  | "agentsAvailable"
  | "apiRequests";

export type AlertRule = {
  id: AlertRuleId;
  journey: JourneyId;
  label: string;
  unit: string;
  direction: AlertDirection;
  warning: number;
  critical: number;
};

export const defaultAlertRules = [
  {
    id: "callUtilization",
    journey: "telephony",
    label: "Uso de capacidad",
    unit: "%",
    direction: "above",
    warning: 60,
    critical: 80,
  },
  {
    id: "edgeCpu",
    journey: "telephony",
    label: "CPU del edge",
    unit: "%",
    direction: "above",
    warning: 60,
    critical: 80,
  },
  {
    id: "edgeMemory",
    journey: "telephony",
    label: "Memoria del edge",
    unit: "%",
    direction: "above",
    warning: 60,
    critical: 80,
  },
  {
    id: "edgeDisk",
    journey: "telephony",
    label: "Disco del edge",
    unit: "%",
    direction: "above",
    warning: 70,
    critical: 85,
  },
  {
    id: "edgeNetwork",
    journey: "telephony",
    label: "Red del edge",
    unit: "%",
    direction: "above",
    warning: 60,
    critical: 80,
  },
  {
    id: "qosMismatches",
    journey: "telephony",
    label: "Desajustes de QoS",
    unit: "desajustes",
    direction: "above",
    warning: 0,
    critical: 8,
  },
  {
    id: "serviceLevel",
    journey: "analytics",
    label: "Nivel de servicio",
    unit: "%",
    direction: "below",
    warning: 80,
    critical: 70,
  },
  {
    id: "queueWaiting",
    journey: "analytics",
    label: "Conversaciones en espera",
    unit: "conversaciones",
    direction: "above",
    warning: 5,
    critical: 15,
  },
  {
    id: "agentsAvailable",
    journey: "analytics",
    label: "Agentes disponibles",
    unit: "agentes",
    direction: "below",
    warning: 5,
    critical: 1,
  },
  {
    id: "apiRequests",
    journey: "usage",
    label: "Solicitudes a la API",
    unit: "solicitudes",
    direction: "above",
    warning: 20000,
    critical: 80000,
  },
] as const satisfies readonly AlertRule[];

export function cloneAlertRules(): AlertRule[] {
  return defaultAlertRules.map((rule) => ({ ...rule }));
}

export function rulesForJourney(rules: AlertRule[], journey: JourneyId) {
  return rules.filter((rule) => rule.journey === journey);
}

export function ruleById(rules: AlertRule[], id: AlertRuleId) {
  return rules.find((rule) => rule.id === id) ?? cloneAlertRules().find((rule) => rule.id === id)!;
}

export function parseThreshold(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  return Number(raw);
}

export function thresholdsAreValid(
  direction: AlertDirection,
  warning: number,
  critical: number,
) {
  if (!Number.isFinite(warning) || !Number.isFinite(critical) || warning < 0 || critical < 0) {
    return false;
  }
  return direction === "above" ? critical > warning : critical < warning;
}

export function alertStatus(value: number, rule: AlertRule): MetricStatus {
  if (rule.direction === "above") {
    if (value > rule.critical) return "critical";
    if (value > rule.warning) return "warning";
    return "healthy";
  }
  if (value < rule.critical) return "critical";
  if (value < rule.warning) return "warning";
  return "healthy";
}

export function directionHint(rule: AlertRule) {
  return rule.direction === "above"
    ? "Aviso y crítico cuando el valor sube."
    : "Aviso y crítico cuando el valor baja.";
}

function storageKey(organizationId: string) {
  return `tansa-alert-rules:${organizationId}`;
}

export function loadAlertRules(organizationId: string): AlertRule[] {
  const defaults = cloneAlertRules();
  if (typeof window === "undefined") return defaults;

  try {
    const raw = window.localStorage.getItem(storageKey(organizationId));
    if (!raw) return defaults;
    const stored = JSON.parse(raw) as Partial<
      Record<AlertRuleId, { warning: number; critical: number }>
    >;
    return defaults.map((rule) => {
      const saved = stored[rule.id];
      if (
        !saved ||
        !thresholdsAreValid(rule.direction, saved.warning, saved.critical)
      ) {
        return rule;
      }
      return { ...rule, warning: saved.warning, critical: saved.critical };
    });
  } catch {
    return defaults;
  }
}

export function saveAlertRules(organizationId: string, rules: AlertRule[]) {
  const payload = Object.fromEntries(
    rules.map((rule) => [rule.id, { warning: rule.warning, critical: rule.critical }]),
  );
  window.localStorage.setItem(storageKey(organizationId), JSON.stringify(payload));
}
