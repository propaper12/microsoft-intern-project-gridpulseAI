import { playSynthBeep, GRIDPULSE_MODEL } from "../utils/constants";
import AgentPipeline from "./AgentPipeline";
import AgentLivePulse from "./AgentLivePulse";

const STATUS_BADGE = {
  SAFE: "badge-stable",
  DIAGNOSING: "badge-warning",
  OVERRIDING: "badge-critical",
};

const STATUS_LABEL = {
  TR: { SAFE: "Güvenli", DIAGNOSING: "Teşhis", OVERRIDING: "Müdahale" },
  EN: { SAFE: "Safe", DIAGNOSING: "Diagnosing", OVERRIDING: "Overriding" },
};

export default function AgentHUD({
  lang,
  sidebarCollapsed,
  agentActive,
  agentStatus,
  activeThought,
  setActiveThought,
  agentLogs,
  spawnedCount,
  agentError,
  onStart,
  onStop,
}) {
  const statusLabel = STATUS_LABEL[lang][agentStatus] || agentStatus;

  return (
    <aside className={`agent-hud agent-hud--slim ${sidebarCollapsed ? "agent-hud--hidden" : ""}`}>
      <div className="agent-hud-header">
        <div className="agent-hud-title-row">
          <h3>{lang === "TR" ? "Agent" : "Agent"}</h3>
          <span className={`agent-status-ring ${agentActive ? "agent-status-ring--live" : ""}`} />
        </div>
        <span className={STATUS_BADGE[agentStatus] || "badge-stable"}>{statusLabel}</span>

        {!agentActive ? (
          <button
            type="button"
            className="agent-autopilot-btn"
            onClick={() => {
              onStart();
              setActiveThought(lang === "TR" ? "Sistem devralınıyor..." : "Taking over system...");
              playSynthBeep(520, "sine", 0.1);
            }}
          >
            <span className="agent-autopilot-icon">▶</span>
            <span>
              <strong>{lang === "TR" ? "AUTOPILOT" : "AUTOPILOT"}</strong>
              <small>{lang === "TR" ? "Otonom yönetim başlat" : "Start autonomous control"}</small>
            </span>
          </button>
        ) : (
          <div className="agent-controls">
            <button type="button" className="btn-start btn-start--active">LIVE</button>
            <button
              type="button"
              className="btn-stop"
              onClick={() => {
                onStop();
                setActiveThought(lang === "TR" ? "Beklemede." : "Standby.");
                playSynthBeep(320, "sine", 0.1);
              }}
            >
              STOP
            </button>
          </div>
        )}
        {agentError ? (
          <p className="agent-hud-error" role="alert">
            {agentError}
          </p>
        ) : null}
      </div>

      <div className="agent-hud-pulse-wrap">
        <AgentLivePulse lang={lang} agentActive={agentActive} agentLogs={agentLogs} activeThought={activeThought} />
      </div>

      <AgentPipeline lang={lang} agentStatus={agentStatus} agentActive={agentActive} />

      <div className="agent-hud-mini-stats">
        <span><strong>{spawnedCount}</strong> {lang === "TR" ? "grafik" : "charts"}</span>
        <span className="agent-model-badge agent-model-badge--mini">
          <span className="agent-model-dot" />
          {GRIDPULSE_MODEL}
        </span>
      </div>

      <p className="agent-hud-hint text-muted">
        {lang === "TR"
          ? "Detaylı operasyon, kararlar ve raporlama → Operasyon Merkezi"
          : "Full ops, decisions & reports → Operations Center"}
      </p>
    </aside>
  );
}
