import { useEffect, useRef, useState } from "react";
import { data, Form, isRouteErrorResponse, Link, useNavigate, useNavigation, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { canConfigureAlerts, type Account } from "../data/account";
import { ActiveAlertsStrip, AlertHistory } from "../components/AlertActivity";
import AlertSettingsPanel from "../components/AlertSettingsPanel";
import CallMetricsWidget from "../components/CallMetricsWidget";
import ChannelMixWidget from "../components/ChannelMixWidget";
import AgentSnapshotWidget from "../components/AgentSnapshotWidget";
import ApiUsageWidget from "../components/ApiUsageWidget";
import CustomMetricWidget from "../components/CustomMetricWidget";
import EdgeHealthWidget from "../components/EdgeHealthWidget";
import QueueLiveWidget from "../components/QueueLiveWidget";
import QosWidget from "../components/QosWidget";
import ServiceLevelWidget from "../components/ServiceLevelWidget";
import TrunkTrafficWidget from "../components/TrunkTrafficWidget";
import UsageBreakdownWidget from "../components/UsageBreakdownWidget";
import {
  analyticsFor,
  simulateAnalytics,
  type AnalyticsSnapshot,
} from "../data/analyticsMetrics";
import {
  activeAlerts,
  alertCrossings,
  pushCrossings,
  readAlerts,
  type AlertCrossing,
  type OperationsReading,
} from "../data/activeAlerts";
import {
  cloneAlertRules,
  loadAlertRules,
  ruleById,
  saveAlertRules,
  type AlertRule,
} from "../data/alertRules";
import {
  dashboardSearch,
  journeys,
  parseJourney,
  type JourneyId,
} from "../data/journeys";
import { simulateCalls, simulateEdge, simulateTrunk } from "../data/mockMetricsData";
import {
  environmentLabel,
  formatUpdatedAt,
  getOrganization,
  listOrganizations,
  type OrganizationDashboard,
  type OrganizationSummary,
} from "../data/organizations";
import {
  simulateUsage,
  totalRequests,
  usageFor,
  type UsageSnapshot,
} from "../data/usageMetrics";

export function meta({ loaderData }: Route.MetaArgs) {
  const name = loaderData?.organization.name;
  return [
    {
      title: name
        ? `${name} | TansaManager`
        : "Métricas de llamadas | TansaManager",
    },
    {
      name: "description",
      content:
        "Panel por organización con tres recorridos: telephony, analytics y usage.",
    },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const organization = getOrganization(url.searchParams.get("org"));
  const journey = parseJourney(url.searchParams.get("journey"));

  if (!organization) {
    throw data("Organización no encontrada", { status: 404 });
  }

  return { organization, organizations: listOrganizations(), journey };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { organization, organizations, journey } = loaderData;
  const authenticated = useRouteLoaderData("authenticated") as
    | { user: Account }
    | undefined;
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentScrolled, setContentScrolled] = useState(false);
  const journeyCopy = journeys.find((item) => item.id === journey) ?? journeys[0];

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    contentRef.current?.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    setContentScrolled(false);
  }, [organization.id, journey]);

  function handleContentScroll(event: React.UIEvent<HTMLDivElement>) {
    const next = event.currentTarget.scrollTop > 8;
    setContentScrolled((current) => (current === next ? current : next));
  }

  return (
    <main className="dashboard">
      <header
        className={
          contentScrolled
            ? "dashboard-header dashboard-header--scrolled"
            : "dashboard-header"
        }
      >
        <a className="brand" href="/" aria-label="TansaManager, inicio">
          <span className="brand-mark" aria-hidden="true">
            T
          </span>
          <span>TansaManager</span>
        </a>
        <div className="header-actions">
          <OrgSelector
            organizations={organizations}
            currentId={organization.id}
            onSelect={(orgId) => {
              navigate(dashboardSearch(orgId, journey), {
                preventScrollReset: true,
              });
            }}
          />
          {authenticated?.user ? <AccountMenu user={authenticated.user} /> : null}
        </div>
      </header>

      <div
        className="dashboard-content"
        ref={contentRef}
        onScroll={handleContentScroll}
      >
        <div className="page-intro">
          <h1>{organization.name}</h1>
          <p className="page-description">{journeyCopy.summary}</p>
        </div>

        <OperationsPanel
          key={organization.id}
          organization={organization}
          journey={journey}
          canConfigure={canConfigureAlerts(authenticated?.user)}
        />
      </div>

      <footer className="dashboard-footer">
        <div className="footer-inner">
          <div className="footer-brand-block">
            <span className="footer-brand">TansaManager</span>
            <span className="footer-note">Monitoreo en tiempo real</span>
          </div>
          <p className="footer-legal">
            © 2026 TansaManager. Todos los derechos reservados.
          </p>
        </div>
        <div className="footer-line" aria-hidden="true" />
      </footer>
    </main>
  );
}

function AccountMenu({ user }: { user: Account }) {
  const navigation = useNavigation();
  const loggingOut =
    navigation.formMethod === "POST" && navigation.formAction === "/logout";
  const initial = user.name.trim().charAt(0).toUpperCase();

  return (
    <div className="account-menu">
      <span className="account-avatar" aria-hidden="true">
        {initial}
      </span>
      <span className="account-meta">
        <span className="account-name">{user.name}</span>
        <span className="account-role">{user.role}</span>
      </span>
      <Form method="post" action="/logout">
        <button
          type="submit"
          className="logout-button"
          disabled={loggingOut}
          aria-label={`Cerrar la sesión de ${user.name}`}
        >
          {loggingOut ? "Saliendo..." : "Salir"}
        </button>
      </Form>
    </div>
  );
}

function OrgSelector({
  organizations,
  currentId,
  onSelect,
}: {
  organizations: OrganizationSummary[];
  currentId: string;
  onSelect: (orgId: string) => void;
}) {
  const current =
    organizations.find((item) => item.id === currentId) ?? organizations[0];
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!current) return null;

  return (
    <div
      className={open ? "org-selector org-selector--open" : "org-selector"}
      ref={rootRef}
    >
      <button
        type="button"
        className="org-selector-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Organización"
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className={`environment-dot environment-dot--${current.environment}`}
          aria-hidden="true"
        />
        <span>{environmentLabel(current.environment)}</span>
        <svg
          className="org-selector-chevron"
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1.5 6 6.5 11 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <ul className="org-selector-menu" role="listbox" aria-label="Organización">
          {organizations.map((item) => {
            const selected = item.id === current.id;
            return (
              <li key={item.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={
                    selected ? "org-option org-option--selected" : "org-option"
                  }
                  onClick={() => {
                    setOpen(false);
                    if (!selected) onSelect(item.id);
                  }}
                >
                  <span
                    className={`environment-dot environment-dot--${item.environment}`}
                    aria-hidden="true"
                  />
                  {environmentLabel(item.environment)}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function OperationsPanel({
  organization,
  journey,
  canConfigure,
}: {
  organization: OrganizationDashboard;
  journey: JourneyId;
  canConfigure: boolean;
}) {
  const [calls, setCalls] = useState(organization.calls);
  const [edges, setEdges] = useState(organization.edges);
  const [trunks, setTrunks] = useState(organization.trunks);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(
    analyticsFor(organization.id),
  );
  const [usage, setUsage] = useState<UsageSnapshot>(
    usageFor(organization.id),
  );
  const [rules, setRules] = useState<AlertRule[]>(() => cloneAlertRules());
  const [alertsMode, setAlertsMode] = useState(false);
  const [crossings, setCrossings] = useState<AlertCrossing[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatedLabel, setUpdatedLabel] = useState(
    `Datos de demostración · actualizado a las ${formatUpdatedAt(organization.updatedAt)}`,
  );

  useEffect(() => {
    setRules(loadAlertRules(organization.id));
  }, [organization.id]);

  function handleRefresh() {
    if (loading) return;

    const refreshedJourney = journey;
    const beforeReading: OperationsReading = { calls, edges, trunks, analytics, usage };
    const nextReading: OperationsReading = { ...beforeReading };
    if (refreshedJourney === "analytics") {
      nextReading.analytics = simulateAnalytics(analytics);
    } else if (refreshedJourney === "usage") {
      nextReading.usage = simulateUsage(usage);
    } else {
      nextReading.calls = simulateCalls(calls);
      nextReading.edges = edges.map(simulateEdge);
      nextReading.trunks = trunks.map(simulateTrunk);
    }
    const at = new Date().toISOString();
    const fresh = alertCrossings(
      readAlerts(rules, beforeReading),
      readAlerts(rules, nextReading),
      at,
      refreshedJourney,
    );

    setLoading(true);
    window.setTimeout(() => {
      setCalls(nextReading.calls);
      setEdges(nextReading.edges);
      setTrunks(nextReading.trunks);
      setAnalytics(nextReading.analytics);
      setUsage(nextReading.usage);
      setCrossings((current) => pushCrossings(current, fresh));
      setUpdatedLabel(
        `Datos de demostración · actualizado a las ${formatUpdatedAt(at)}`,
      );
      setLoading(false);
    }, 600);
  }

  const waiting = analytics.queues.reduce((sum, queue) => sum + queue.waiting, 0);
  const journeyLabel = journeys.find((item) => item.id === journey)?.label ?? "Telephony";
  const callsRule = ruleById(rules, "callUtilization");
  const qosRule = ruleById(rules, "qosMismatches");
  const serviceRule = ruleById(rules, "serviceLevel");
  const waitingRule = ruleById(rules, "queueWaiting");
  const agentsRule = ruleById(rules, "agentsAvailable");
  const apiRule = ruleById(rules, "apiRequests");
  const reading: OperationsReading = { calls, edges, trunks, analytics, usage };
  const fired = activeAlerts(rules, reading);
  const configuring = alertsMode && canConfigure;

  function handleSaveRules(next: AlertRule[]) {
    setRules(next);
    saveAlertRules(organization.id, next);
  }

  return (
    <>
    <div className="alert-activity">
      <ActiveAlertsStrip
        alerts={fired}
        organizationId={organization.id}
        currentJourney={journey}
      />
      <AlertHistory crossings={crossings} />
    </div>
    <div className="dashboard-controls">
      <nav className="journey-switcher" aria-label="Segmentos">
        {journeys.map((item) => {
          const selected = item.id === journey;
          return (
            <Link
              key={item.id}
              to={dashboardSearch(organization.id, item.id)}
              preventScrollReset
              className={selected ? "journey-tab journey-tab--active" : "journey-tab"}
              aria-current={selected ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="dashboard-toolbar">
        <div className="toolbar-actions">
          {canConfigure ? (
            <button
              className={
                configuring
                  ? "refresh-button alerts-toggle alerts-toggle--active"
                  : "refresh-button alerts-toggle"
              }
              type="button"
              aria-pressed={configuring}
              onClick={() => setAlertsMode((current) => !current)}
            >
              {configuring ? "Ver métricas" : "Configurar alertas"}
            </button>
          ) : null}
          {configuring ? null : (
            <button
              className="refresh-button refresh-button--toolbar"
              type="button"
              onClick={handleRefresh}
              disabled={loading}
            >
              <svg
                className={
                  loading ? "refresh-icon refresh-icon--spinning" : "refresh-icon"
                }
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M16.5 8A6.7 6.7 0 0 0 4.9 5.2L3.5 6.7M3.5 6.7V3.8M3.5 6.7h2.9M3.5 12a6.7 6.7 0 0 0 11.6 2.8l1.4-1.5m0 0v2.9m0-2.9h-2.9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {loading ? "Actualizando..." : "Simular actualización (Mock)"}
            </button>
          )}
        </div>
        <p className="demo-note" aria-live="polite">
          {updatedLabel}
        </p>
      </div>
    </div>

      {configuring ? (
        <AlertSettingsPanel
          key={journey}
          journey={journey}
          journeyLabel={journeyLabel}
          organizationLabel={environmentLabel(organization.environment)}
          rules={rules}
          onSave={handleSaveRules}
        />
      ) : (
      <div className="metrics-grid" aria-busy={loading}>
        {journey === "telephony" ? (
          <>
            <CallMetricsWidget
              metrics={calls}
              warning={callsRule.warning}
              critical={callsRule.critical}
            />
            <QosWidget
              trunks={trunks}
              warning={qosRule.warning}
              critical={qosRule.critical}
            />
            <EdgeHealthWidget edges={edges} rules={rules} />
            <TrunkTrafficWidget trunks={trunks} />
            <CustomMetricWidget edges={edges} trunks={trunks} />
          </>
        ) : null}

        {journey === "analytics" ? (
          <>
            <QueueLiveWidget
              queues={analytics.queues}
              serviceLevel={serviceRule}
              waitingRule={waitingRule}
            />
            <ServiceLevelWidget
              points={analytics.serviceLevelByHour}
              rule={serviceRule}
            />
            <AgentSnapshotWidget
              agents={analytics.agents}
              waiting={waiting}
              rule={agentsRule}
            />
            <ChannelMixWidget channels={analytics.channels} />
          </>
        ) : null}

        {journey === "usage" ? (
          <>
            <ApiUsageWidget total={totalRequests(usage)} rule={apiRule} />
            <UsageBreakdownWidget
              title="Por cliente OAuth"
              titleId="usage-clients-title"
              description="Quién está llamando a la plataforma"
              badge="clientes"
              icon={
                <svg viewBox="0 0 24 24" fill="none">
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M8 12h8M8 9h5M8 15h3"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              }
              rows={usage.clients.map((client) => ({
                id: client.id,
                label: client.name,
                value: client.requests,
              }))}
            />
            <UsageBreakdownWidget
              title="Por método"
              titleId="usage-methods-title"
              description="Cómo se reparte el tráfico HTTP"
              badge="http"
              icon={
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 7h14M5 12h14M5 17h14"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              }
              rows={usage.methods.map((method) => ({
                id: method.method,
                label: method.method,
                value: method.requests,
              }))}
            />
          </>
        ) : null}
      </div>
      )}
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "No pudimos cargar las métricas";
  let details = "Volvé a intentar en unos segundos.";

  if (isRouteErrorResponse(error) && error.status === 404) {
    title = "Organización no encontrada";
    details = "El enlace no coincide con ninguna organización de demostración.";
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="dashboard">
      <div className="dashboard-content">
        <div className="page-intro">
          <p className="eyebrow">CENTRO DE OPERACIONES</p>
          <h1>{title}</h1>
          <p className="page-description">{details}</p>
          <Link className="error-link" to="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
