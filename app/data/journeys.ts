export const journeyIds = ["telephony", "analytics", "usage"] as const;

export type JourneyId = (typeof journeyIds)[number];

export const journeys = [
  {
    id: "telephony",
    label: "Telephony",
    summary: "Capacidad, edges, trunks y calidad de la voz.",
  },
  {
    id: "analytics",
    label: "Analytics",
    summary: "Colas en vivo, canales y nivel de servicio.",
  },
  {
    id: "usage",
    label: "Usage",
    summary: "Consumo de la API. No define qué es facturable.",
  },
] as const satisfies readonly {
  id: JourneyId;
  label: string;
  summary: string;
}[];

export function parseJourney(value: string | null): JourneyId {
  if (value === "analytics" || value === "usage") return value;
  return "telephony";
}

export function dashboardSearch(orgId: string, journey: JourneyId) {
  const params = new URLSearchParams({ org: orgId, journey });
  return `?${params.toString()}`;
}
