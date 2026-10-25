import { useEffect, useState } from "react";
import {
  cloneAlertRules,
  directionHint,
  parseThreshold,
  rulesForJourney,
  thresholdsAreValid,
  type AlertRule,
} from "../data/alertRules";
import type { JourneyId } from "../data/journeys";

type AlertSettingsPanelProps = {
  journey: JourneyId;
  journeyLabel: string;
  organizationLabel: string;
  rules: AlertRule[];
  onSave: (rules: AlertRule[]) => void;
};

type Draft = Record<string, { warning: string; critical: string }>;

function draftFrom(rules: AlertRule[]): Draft {
  return Object.fromEntries(
    rules.map((rule) => [
      rule.id,
      { warning: String(rule.warning), critical: String(rule.critical) },
    ]),
  );
}

export default function AlertSettingsPanel({
  journey,
  journeyLabel,
  organizationLabel,
  rules,
  onSave,
}: AlertSettingsPanelProps) {
  const visible = rulesForJourney(rules, journey);
  const [draft, setDraft] = useState<Draft>(() => draftFrom(rules));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    setDraft(draftFrom(rules));
  }, [rules]);

  function update(id: string, field: "warning" | "critical", value: string) {
    setSaved("");
    setDraft((current) => ({
      ...current,
      [id]: { ...current[id], [field]: value },
    }));
  }

  function handleSave() {
    const next: AlertRule[] = [];
    for (const rule of rules) {
      if (rule.journey !== journey) {
        next.push(rule);
        continue;
      }
      const values = draft[rule.id];
      const warning = parseThreshold(values?.warning);
      const critical = parseThreshold(values?.critical);
      if (warning == null || critical == null) {
        setSaved("");
        setError(`${rule.label}: completá aviso y crítico.`);
        return;
      }
      if (!thresholdsAreValid(rule.direction, warning, critical)) {
        setSaved("");
        setError(
          rule.direction === "above"
            ? `${rule.label}: el crítico tiene que ser mayor que el aviso.`
            : `${rule.label}: el crítico tiene que ser menor que el aviso.`,
        );
        return;
      }
      next.push({ ...rule, warning, critical });
    }
    setError("");
    setSaved(`Alertas de ${journeyLabel} guardadas para ${organizationLabel}.`);
    onSave(next);
  }

  function handleReset() {
    const defaults = cloneAlertRules();
    const restored = rules.map((rule) =>
      rule.journey === journey
        ? (defaults.find((item) => item.id === rule.id) ?? rule)
        : rule,
    );
    setError("");
    setSaved(`Alertas de ${journeyLabel} restablecidas.`);
    onSave(restored);
  }

  return (
    <section className="alerts-panel" aria-labelledby="alerts-title">
      <div className="alerts-heading">
        <h2 id="alerts-title">Alertas de {journeyLabel}</h2>
        <p>
          Estos umbrales valen para {organizationLabel}. El aviso pinta de ámbar
          y el crítico de rojo en las tarjetas de este segmento.
        </p>
      </div>

      <ul className="alert-list">
        {visible.map((rule) => (
          <li key={rule.id} className="alert-rule">
            <div>
              <p className="alert-label">{rule.label}</p>
              <p className="alert-hint">
                {directionHint(rule)} Unidad: {rule.unit}.
              </p>
            </div>
            <label className="alert-field">
              Aviso
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={draft[rule.id]?.warning ?? ""}
                onChange={(event) => update(rule.id, "warning", event.target.value)}
              />
            </label>
            <label className="alert-field">
              Crítico
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={draft[rule.id]?.critical ?? ""}
                onChange={(event) => update(rule.id, "critical", event.target.value)}
              />
            </label>
          </li>
        ))}
      </ul>

      <div className="alert-actions">
        <button className="refresh-button" type="button" onClick={handleSave}>
          Guardar alertas
        </button>
        <button className="alerts-reset" type="button" onClick={handleReset}>
          Restablecer
        </button>
      </div>
      {error ? (
        <p className="threshold-error" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="capacity-note" aria-live="polite">
          {saved}
        </p>
      ) : null}
    </section>
  );
}
