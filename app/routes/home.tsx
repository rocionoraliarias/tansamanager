import type { Route } from "./+types/home";
import CallMetricsWidget from "../components/CallMetricsWidget";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Métricas de llamadas | Genesys" },
    {
      name: "description",
      content: "Panel de métricas de llamadas concurrentes de Genesys.",
    },
  ];
}

export default function Home() {
  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <a className="brand" href="/" aria-label="Genesys, inicio">
          <span className="brand-mark" aria-hidden="true">
            g
          </span>
          <span>genesys</span>
        </a>
        <span className="environment-badge">
          <span className="environment-dot" aria-hidden="true" />
          Entorno de prueba
        </span>
      </header>

      <div className="dashboard-content">
        <div className="page-intro">
          <p className="eyebrow">CENTRO DE OPERACIONES</p>
          <h1>Métricas en tiempo real</h1>
          <p className="page-description">
            Consulta el estado y la capacidad de tus llamadas concurrentes.
          </p>
        </div>

        <CallMetricsWidget />
      </div>

      <footer className="dashboard-footer">
        <span>Genesys Metrics</span>
        <span>Prototipo de monitoreo</span>
      </footer>
    </main>
  );
}
