export type UsageClient = {
  id: string;
  name: string;
  requests: number;
};

export type UsageMethod = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  requests: number;
};

export type UsageSnapshot = {
  clients: UsageClient[];
  methods: UsageMethod[];
};

export const usageByOrganization = {
  development: {
    clients: [
      { id: "tansa", name: "tansa-connector", requests: 8200 },
      { id: "reporting", name: "reporting", requests: 3100 },
      { id: "purecloud", name: "purecloud", requests: 900 },
    ],
    methods: [
      { method: "GET", requests: 8600 },
      { method: "POST", requests: 2400 },
      { method: "PUT", requests: 800 },
      { method: "DELETE", requests: 400 },
    ],
  },
  staging: {
    clients: [
      { id: "tansa", name: "tansa-connector", requests: 28000 },
      { id: "reporting", name: "reporting", requests: 14000 },
      { id: "purecloud", name: "purecloud", requests: 6200 },
    ],
    methods: [
      { method: "GET", requests: 30000 },
      { method: "POST", requests: 12000 },
      { method: "PUT", requests: 4200 },
      { method: "DELETE", requests: 2000 },
    ],
  },
  production: {
    clients: [
      { id: "tansa", name: "tansa-connector", requests: 74000 },
      { id: "reporting", name: "reporting", requests: 31000 },
      { id: "purecloud", name: "purecloud", requests: 18000 },
    ],
    methods: [
      { method: "GET", requests: 70000 },
      { method: "POST", requests: 34000 },
      { method: "PUT", requests: 12000 },
      { method: "DELETE", requests: 7000 },
    ],
  },
} satisfies Record<string, UsageSnapshot>;

export function usageFor(organizationId: string): UsageSnapshot {
  if (organizationId === "staging" || organizationId === "production") {
    return usageByOrganization[organizationId];
  }
  return usageByOrganization.development;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function jitterRequests(value: number) {
  const delta = Math.round(value * (Math.random() - 0.45) * 0.12);
  return clamp(value + delta, 0, 500000);
}

export function totalRequests(snapshot: UsageSnapshot) {
  return snapshot.clients.reduce((sum, client) => sum + client.requests, 0);
}

export function simulateUsage(current: UsageSnapshot): UsageSnapshot {
  return {
    clients: current.clients.map((client) => ({
      ...client,
      requests: jitterRequests(client.requests),
    })),
    methods: current.methods.map((method) => ({
      ...method,
      requests: jitterRequests(method.requests),
    })),
  };
}

export function formatRequests(value: number) {
  return new Intl.NumberFormat("es-AR").format(value);
}
