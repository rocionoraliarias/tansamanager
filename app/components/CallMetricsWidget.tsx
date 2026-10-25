import { useState } from "react";
import { mockMetricsData } from "../data/mockMetricsData";

export default function CallMetricsWidget() {
  const [metrics, setMetrics] = useState(mockMetricsData);
  const [loading, setLoading] = useState(false);
  const { activeCallsCount, maxActiveCalls, metricType, utilizationPercentage } =
    metrics;
  const formattedUtilization = utilizationPercentage.toFixed(1);
  const status =
    utilizationPercentage > 80
      ? "critical"
      : utilizationPercentage > 60
        ? "warning"
        : "healthy";

  function handleRefresh() {
    if (loading) return;

    setLoading(true);
    window.setTimeout(() => {
      setMetrics((currentMetrics) => {
        const nextActiveCallsCount = Math.floor(
          Math.random() * (currentMetrics.maxActiveCalls + 1),
        );

        return {
          ...currentMetrics,
          activeCallsCount: nextActiveCallsCount,
          utilizationPercentage:
            currentMetrics.maxActiveCalls > 0
              ? Number(
                  (
                    (nextActiveCallsCount / currentMetrics.maxActiveCalls) *
                    100
                  ).toFixed(1),
                )
              : 0,
        };
      });
      setLoading(false);
    }, 600);
  }

  return (
    <section className="metrics-card" aria-labelledby="calls-title">
      <div className="card-heading">
        <div className="metric-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M7.2 3.8 9.1 7.5 7.4 9.2a15.4 15.4 0 0 0 7.4 7.4l1.7-1.7 3.7 1.9-.5 3.2a1.5 1.5 0 0 1-1.7 1.2A18.7 18.7 0 0 1 2.8 5.8 1.5 1.5 0 0 1 4 4.1l3.2-.3Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 4a6 6 0 0 1 6 6M14 7a3 3 0 0 1 3 3"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="metric-heading-copy">
          <h2 id="calls-title">Llamadas concurrentes</h2>
          <p>Capacidad activa de la plataforma</p>
        </div>
        <span className="metric-type">{metricType}</span>
      </div>

      <div className="metric-total">
        <span className="active-count">{activeCallsCount}</span>
        <span className="max-count">
          <span aria-hidden="true">/</span> {maxActiveCalls} máx.
        </span>
      </div>

      <div className="usage-row">
        <span>Uso de capacidad</span>
        <span className={`usage-value usage-value--${status}`}>
          {formattedUtilization}%
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Uso de capacidad de llamadas"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(Math.max(utilizationPercentage, 0), 100)}
        aria-valuetext={`${formattedUtilization}% utilizado`}
      >
        <div
          className={`progress-fill progress-fill--${status}`}
          style={{
            width: `${Math.min(Math.max(utilizationPercentage, 0), 100)}%`,
          }}
        />
      </div>

      <div className="capacity-note">
        <span
          className={`status-dot status-dot--${status}`}
          aria-hidden="true"
        />
        <span>
          {Math.max(maxActiveCalls - activeCallsCount, 0)} llamadas disponibles
        </span>
      </div>

      <button
        className="refresh-button"
        type="button"
        onClick={handleRefresh}
        disabled={loading}
      >
        <svg
          className={loading ? "refresh-icon refresh-icon--spinning" : "refresh-icon"}
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
      <p className="demo-note">Datos de demostración · actualización simulada</p>
    </section>
  );
}
