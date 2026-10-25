import { useState } from "react";
import { Link } from "react-router";
import type { ActiveAlert, AlertCrossing } from "../data/activeAlerts";
import { dashboardSearch, type JourneyId } from "../data/journeys";
import { formatUpdatedAt } from "../data/organizations";
import { statusLabel, type MetricStatus } from "../data/metricStatus";

type Attention = "critical" | "warning" | "clear";

function attentionOf(statuses: MetricStatus[]): Attention {
  if (statuses.includes("critical")) return "critical";
  if (statuses.includes("warning")) return "warning";
  return "clear";
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function ToggleIcon({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M8 2.5v11M2.5 8h11"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4 4 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MinimizeButton({
  collapsed,
  controls,
  label,
  attention,
  onClick,
}: {
  collapsed: boolean;
  controls: string;
  label: string;
  attention: Attention;
  onClick: () => void;
}) {
  const blinking = attention === "critical" || attention === "warning";

  return (
    <button
      type="button"
      className={
        blinking
          ? `alert-minimize alert-minimize--${attention}`
          : "alert-minimize"
      }
      aria-expanded={!collapsed}
      aria-controls={controls}
      aria-label={collapsed ? `Mostrar ${label}` : `Minimizar ${label}`}
      onClick={onClick}
    >
      <ToggleIcon collapsed={collapsed} />
    </button>
  );
}

type ActiveAlertsStripProps = {
  alerts: ActiveAlert[];
  organizationId: string;
  currentJourney: JourneyId;
};

export function ActiveAlertsStrip({
  alerts,
  organizationId,
  currentJourney,
}: ActiveAlertsStripProps) {
  const [collapsed, setCollapsed] = useState(false);
  const attention = attentionOf(alerts.map((alert) => alert.status));
  const ordered = [...alerts].sort((left, right) => {
    if (left.status === right.status) return 0;
    return left.status === "critical" ? -1 : 1;
  });
  const critical = alerts.filter((alert) => alert.status === "critical").length;
  const warning = alerts.length - critical;
  const summary = [
    critical > 0 ? countLabel(critical, "crítica", "críticas") : "",
    warning > 0 ? countLabel(warning, "aviso", "avisos") : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      className={
        collapsed
          ? `alert-strip alert-strip--${attention} alert-strip--collapsed`
          : `alert-strip alert-strip--${attention}`
      }
      aria-labelledby="active-alerts-title"
    >
      <div className="alert-panel-header">
        <div className="alert-panel-heading">
          <h2 id="active-alerts-title">Alertas activas</h2>
          <span className={`alert-count alert-count--${attention}`}>
            {alerts.length === 0 ? "Sin alertas" : summary}
          </span>
        </div>
        <MinimizeButton
          collapsed={collapsed}
          controls="active-alerts-panel"
          label="alertas activas"
          attention={attention}
          onClick={() => setCollapsed((current) => !current)}
        />
      </div>
      <div id="active-alerts-panel" hidden={collapsed}>
        {ordered.length === 0 ? (
          <p className="alert-strip-empty">Ninguna alerta activa en esta organización.</p>
        ) : (
          <ul className="alert-chip-list">
            {ordered.map((alert) => (
              <li key={alert.rule.id}>
                <Link
                  to={dashboardSearch(organizationId, alert.rule.journey)}
                  preventScrollReset
                  className={`alert-chip alert-chip--${alert.status}`}
                  aria-current={
                    alert.rule.journey === currentJourney ? "page" : undefined
                  }
                >
                  <span>{alert.rule.label}</span>
                  <span className="alert-chip-value">{alert.valueLabel}</span>
                  <span>{statusLabel(alert.status)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

type AlertHistoryProps = {
  crossings: AlertCrossing[];
};

export function AlertHistory({ crossings }: AlertHistoryProps) {
  const [collapsed, setCollapsed] = useState(false);
  if (crossings.length === 0) return null;

  const attention = attentionOf(crossings.map((event) => event.status));

  return (
    <section
      className={
        collapsed
          ? `alert-history alert-history--${attention} alert-history--collapsed`
          : `alert-history alert-history--${attention}`
      }
      aria-labelledby="alert-history-title"
    >
      <div className="alert-panel-header">
        <div className="alert-panel-heading">
          <h2 id="alert-history-title">Últimos cruces</h2>
          <span className={`alert-count alert-count--${attention}`}>
            {countLabel(crossings.length, "cruce", "cruces")}
          </span>
        </div>
        <MinimizeButton
          collapsed={collapsed}
          controls="alert-history-panel"
          label="últimos cruces"
          attention={attention}
          onClick={() => setCollapsed((current) => !current)}
        />
      </div>
      <ul id="alert-history-panel" hidden={collapsed} aria-live="polite">
        {crossings.map((event) => (
          <li key={event.id} className={`alert-history-item alert-history-item--${event.status}`}>
            <time dateTime={event.at}>{formatUpdatedAt(event.at)}</time>
            <span>{event.label}</span>
            <span>{event.valueLabel}</span>
            <span className={`alert-history-status alert-history-status--${event.status}`}>
              {statusLabel(event.status)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
