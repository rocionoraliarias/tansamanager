import { timingSafeEqual } from "node:crypto";
import { createCookieSessionStorage } from "react-router";
import type { Account, DemoLogin } from "./data/account";

type SessionData = {
  userId: string;
};

const demoAccounts: DemoLogin[] = [
  {
    id: "operaciones",
    name: "Mesa de operaciones",
    email: "operaciones@tansa.demo",
    password: "tansa2026",
    role: "Operaciones",
  },
  {
    id: "supervision",
    name: "Supervisión",
    email: "supervision@tansa.demo",
    password: "tansa2026",
    role: "Supervisión",
  },
  {
    id: "prueba",
    name: "Prueba",
    email: "prueba@prueba.com",
    password: "avances123",
    role: "Demostración",
  },
];

const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    name: "__tansa_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET ?? "tansa-manager-demo-secret"],
    secure: false,
    maxAge: 60 * 60 * 8,
  },
});

export function listDemoLogins() {
  return demoAccounts.map((account) => ({ ...account }));
}

export function safeRedirectPath(value: string | null, fallback = "/") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  if (value.includes("\0")) return fallback;
  return value;
}

export function authenticate(email: string, password: string): Account | null {
  const normalized = email.trim().toLowerCase();
  const account =
    demoAccounts.find((item) => item.email === normalized) ?? demoAccounts[0];
  const passwordMatches = sameSecret(password, account.password);
  const knownAccount = demoAccounts.find((item) => item.email === normalized);

  if (!knownAccount || !passwordMatches) return null;

  return toAccount(knownAccount);
}

export async function getUser(request: Request): Promise<Account | null> {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const account = demoAccounts.find((item) => item.id === userId);
  return account ? toAccount(account) : null;
}

export async function startSession(request: Request, userId: string) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  session.set("userId", userId);
  return sessionStorage.commitSession(session, cookieOptions(request));
}

export async function endSession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return sessionStorage.destroySession(session, cookieOptions(request));
}

function toAccount(account: DemoLogin): Account {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };
}

function sameSecret(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  if (leftBytes.length !== rightBytes.length) return false;
  return timingSafeEqual(leftBytes, rightBytes);
}

function cookieOptions(request: Request) {
  return { secure: new URL(request.url).protocol === "https:" };
}
