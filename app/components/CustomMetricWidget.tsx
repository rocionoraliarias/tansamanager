import { useState } from "react";
import CardHeading from "./CardHeading";
import UsageBar from "./UsageBar";
import {
  edgeMetricOptions,
  formatMetricValue,
  trunkMetricOptions,
  type EdgeMetricId,
  type EdgeSnapshot,
  type MetricOption,
  type TrunkMetricId,
  type TrunkSnapshot,
} from "../data/mockMetricsData";
import { metricStatus, statusLabel } from "../data/metricStatus";

type CustomView = "number" | "bar" | "line";

type CustomMetricWidgetProps = {
  edges: EdgeSnapshot[];
  trunks: TrunkSnapshot[];
};

const views: { id: CustomView; label: string }[] = [
  { id: "number", label: "Número" },
  { id: "bar", label: "Barra" },
  { id: "line", label: "Línea" },
];

function isEdgeMetric(id: string): id is EdgeMetricId {
  return edgeMetricOptions.some((option) => option.id === id);
}

export default function CustomMetricWidget({
  edges,
  trunks,
}: CustomMetricWidgetProps) {
  const [resourceKey, setResourceKey] = useState(`edge:${edges[0]?.id ?? ""}`);
  const [metricId, setMetricId] = useState<EdgeMetricId | TrunkMetricId>(
    "cpuPct",
  );
  const [view, setView] = useState<CustomView>("line");
  const [warningInput, setWarningInput] = useState("60");
  const [criticalInput, setCriticalInput] = useState("80");

  const [resourceType, resourceId] = resourceKey.split(":");
  const isEdge = resourceType === "edge";
  const options: readonly MetricOption[] = isEdge
    ? edgeMetricOptions
    : trunkMetricOptions;
  const selectedOption =
    options.find((option) => option.id === metricId) ?? options[0];
  const edge = edges.find((item) => item.id === resourceId) ?? edges[0];
  const trunk = trunks.find((item) => item.id === resourceId) ?? trunks[0];
  const resourceName = isEdge ? edge?.name : trunk?.name;

  const value = isEdge
    ? (edge?.[selectedOption.id as EdgeMetricId] ?? 0)
    : (trunk?.[selectedOption.id as TrunkMetricId] ?? 0);
  const history = isEdge
    ? (edge?.history[selectedOption.id as EdgeMetricId] ?? [])
    : (trunk?.history[selectedOption.id as TrunkMetricId] ?? []);

  const warning = Number(warningInput);
  const critical = Number(criticalInput);
  const thresholdsValid =
    Number.isFinite(warning) &&
    Number.isFinite(critical) &&
    warning >= 0 &&
    critical > warning;
  const status = thresholdsValid
    ? metricStatus(value, warning, critical)
    : "healthy";
  const formattedValue = formatMetricValue(value, selectedOption.unit);
  const scale = Math.max(selectedOption.scale, value, ...history, 1);

  function selectResource(nextKey: string) {
    const nextIsEdge = nextKey.startsWith("edge:");
    const nextOptions = nextIsEdge ? edgeMetricOptions : trunkMetricOptions;
    const metricStillValid = nextOptions.some((option) => option.id === metricId);

    setResourceKey(nextKey);
    if (metricStillValid) return;

    const nextOption = nextOptions[0];
    setMetricId(nextOption.id);
    setWarningInput(String(nextOption.warning));
    setCriticalInput(String(nextOption.critical));
  }

  function selectMetric(nextId: string) {
    const nextOption = options.find((option) => option.id === nextId);
    if (!nextOption || !isSelectableMetric(nextId)) return;

    setMetricId(nextId);
    setWarningInput(String(nextOption.warning));
    setCriticalInput(String(nextOption.critical));
  }

  function moveView(direction: 1 | -1) {
    const index = views.findIndex((item) => item.id === view);
    const next = views[(index + direction + views.length) % views.length];
    setView(next.id);
  }

  return (
    <section className="metrics-card metrics-card--span" aria-labelledby="custom-title">
      <CardHeading
        title="Métrica personalizada"
        titleId="custom-title"
        description="Elegí el recurso, la vista y los umbrales"
        badge="custom"
        icon={
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h10M4 12h16M4 17h7"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <circle cx="16.5" cy="7" r="2" stroke="currentColor" strokeWidth="1.7" />
            <circle cx="9" cy="17" r="2" stroke="currentColor" strokeWidth="1.7" />
          </svg>
        }
      />

      <div className="custom-controls">
        <label className="control">
          Recurso
          <select
            value={resourceKey}
            onChange={(event) => selectResource(event.target.value)}
          >
            <optgroup label="Edges">
              {edges.map((item) => (
                <option key={item.id} value={`edge:${item.id}`}>
                  {item.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Trunks">
              {trunks.map((item) => (
                <option key={item.id} value={`trunk:${item.id}`}>
                  {item.name}
                </option>
              ))}
            </optgroup>
          </select>
        </label>

        <label className="control">
          Métrica
          <select
            value={selectedOption.id}
            onChange={(event) => selectMetric(event.target.value)}
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="control">
          <span id="custom-view-label">Vista</span>
          <div
            className="segmented"
            role="radiogroup"
            aria-labelledby="custom-view-label"
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                moveView(1);
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                moveView(-1);
              }
            }}
          >
            {views.map((item) => {
              const selected = view === item.id;
              return (
                <button
                  key={item.id}
                  className={selected ? "segment segment--active" : "segment"}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setView(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="control control--threshold">
          Aviso
          <input
            type="number"
            min={0}
            inputMode="decimal"
            value={warningInput}
            onChange={(event) => setWarningInput(event.target.value)}
          />
        </label>

        <label className="control control--threshold">
          Crítico
          <input
            type="number"
            min={0}
            inputMode="decimal"
            value={criticalInput}
            onChange={(event) => setCriticalInput(event.target.value)}
          />
        </label>
      </div>

      <div className="custom-preview">
        <p className="custom-caption">
          {resourceName} · {selectedOption.label}
          {thresholdsValid ? ` · ${statusLabel(status)}` : ""}
        </p>

        {view === "number" ? (
          <div className="metric-total">
            <span className={`active-count active-count--${thresholdsValid ? status : "neutral"}`}>
              {formattedValue}
            </span>
            <span className="max-count">{selectedOption.unit}</span>
          </div>
        ) : null}

        {view === "bar" ? (
          <UsageBar
            label={selectedOption.label}
            valueLabel={`${formattedValue} ${selectedOption.unit}`}
            widthPercent={(value / scale) * 100}
            tone={thresholdsValid ? status : "inbound"}
          />
        ) : null}

        {view === "line" ? (
          <MetricLine
            values={history}
            scale={scale}
            warning={thresholdsValid ? warning : null}
            critical={thresholdsValid ? critical : null}
            status={thresholdsValid ? status : "inbound"}
            unit={selectedOption.unit}
            label={`${selectedOption.label} de ${resourceName}`}
          />
        ) : null}

        {thresholdsValid ? (
          <p className="capacity-note">
            Los umbrales solo cambian el color de esta tarjeta.
          </p>
        ) : (
          <p className="threshold-error" role="alert">
            El aviso tiene que ser un número menor que el crítico.
          </p>
        )}
      </div>
    </section>
  );
}

function isSelectableMetric(id: string): id is EdgeMetricId | TrunkMetricId {
  return isEdgeMetric(id) || trunkMetricOptions.some((option) => option.id === id);
}

type MetricLineProps = {
  values: number[];
  scale: number;
  warning: number | null;
  critical: number | null;
  status: "healthy" | "warning" | "critical" | "inbound";
  unit: MetricOption["unit"];
  label: string;
};

function MetricLine({
  values,
  scale,
  warning,
  critical,
  status,
  unit,
  label,
}: MetricLineProps) {
  const width = 640;
  const height = 168;
  const padX = 12;
  const padY = 16;
  const innerWidth = width - padX * 2;
  const innerHeight = height - padY * 2;
  const points = values.map((point, index) => {
    const x =
      values.length === 1
        ? width / 2
        : padX + (index / (values.length - 1)) * innerWidth;
    const y = padY + (1 - point / scale) * innerHeight;
    return { x, y, point };
  });
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  function thresholdY(threshold: number) {
    return padY + (1 - Math.min(threshold, scale) / scale) * innerHeight;
  }

  return (
    <figure className="line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        {warning !== null ? (
          <line
            x1={padX}
            x2={width - padX}
            y1={thresholdY(warning)}
            y2={thresholdY(warning)}
            className="line-threshold line-threshold--warning"
          />
        ) : null}
        {critical !== null ? (
          <line
            x1={padX}
            x2={width - padX}
            y1={thresholdY(critical)}
            y2={thresholdY(critical)}
            className="line-threshold line-threshold--critical"
          />
        ) : null}
        <path d={line} className={`line-series line-series--${status}`} />
        {points.map((point) => (
          <circle
            key={`${point.x}-${point.point}`}
            cx={point.x}
            cy={point.y}
            r="3.2"
            className={`line-point line-point--${status}`}
          />
        ))}
      </svg>
      <figcaption className="line-caption">
        Últimas {values.length} muestras simuladas · {unit}
      </figcaption>
      {warning !== null && critical !== null ? (
        <div className="line-legend">
          <span>
            <i className="legend-swatch legend-swatch--warning" aria-hidden="true" />
            Aviso {warning}
          </span>
          <span>
            <i className="legend-swatch legend-swatch--critical" aria-hidden="true" />
            Crítico {critical}
          </span>
        </div>
      ) : null}
      <ul className="sr-only">
        {values.map((point, index) => (
          <li key={`${index}-${point}`}>
            Muestra {index + 1}: {formatMetricValue(point, unit)} {unit}
          </li>
        ))}
      </ul>
    </figure>
  );
}
