import SpawnedChartCanvas from "../components/SpawnedChartCanvas";
import PillarsShowcase from "../components/PillarsShowcase";
import AgentOpsCenter from "../components/AgentOpsCenter";
import { GRIDPULSE_MODEL } from "../utils/constants";

export default function AIControlRoom({
  lang,
  systemStatus,
  setActiveTab,
  alerts,
  spawnedCharts,
  agentActive,
  agentStatus,
  agentLogs,
  agentInsights,
  agentConfig,
  reportHistory,
  activeThought,
  onUpdateConfig,
  onSendReport,
  onRefreshInsights,
}) {
  return (
    <div className="scada-command-center">
      <div className="content-header scada-command-header">
        <div>
          <h2>{lang === "TR" ? "Otonom SCADA Merkezi" : "Autonomous SCADA Center"}</h2>
          <p className="scada-command-subtitle">
            {lang === "TR"
              ? "Agent yönetimi · canlı grafik tuvali · operasyon & raporlama"
              : "Agent control · live chart canvas · operations & reporting"}
          </p>
        </div>
        <div className="scada-command-badges">
          <span className={`badge-stable ${systemStatus.ollama === "ONLINE" ? "" : "badge-warning"}`}>
            {systemStatus.ollama === "ONLINE" ? `Ollama · ${GRIDPULSE_MODEL}` : "Ollama Offline"}
          </span>
          {agentActive && (
            <span className="badge-stable">
              <span className="live-dot" style={{ marginRight: 6 }} />
              Agent Active
            </span>
          )}
          {spawnedCharts.length > 0 && (
            <span className="badge-stable">{Math.min(spawnedCharts.length, 12)} {lang === "TR" ? "panel" : "panels"}</span>
          )}
          <button type="button" className="btn-primary btn-sm" onClick={() => setActiveTab("copilot")}>
            {lang === "TR" ? "Grid AI Copilot →" : "Grid AI Copilot →"}
          </button>
        </div>
      </div>

      <PillarsShowcase lang={lang} compact agentActive={agentActive} />

      {agentActive && (
        <div className="orchestrator-banner">
          <span className="live-dot" />
          <strong>{lang === "TR" ? "Otonom Mod Aktif" : "Autonomous Mode Active"}</strong>
          <span className="text-muted">
            {lang === "TR"
              ? "Agent 12 SCADA panelini canlı yeniliyor; kritik durumlarda rapor gönderiyor."
              : "Agent live-refreshes 12 SCADA panels; emails reports on critical events."}
          </span>
        </div>
      )}

      <section className="scada-command-canvas">
        <SpawnedChartCanvas
          lang={lang}
          spawnedCharts={spawnedCharts}
          agentActive={agentActive}
          agentLogs={agentLogs}
          agentStatus={agentStatus}
          onOpenCopilot={() => setActiveTab("copilot")}
        />
      </section>

      <AgentOpsCenter
        lang={lang}
        agentActive={agentActive}
        agentStatus={agentStatus}
        agentLogs={agentLogs}
        spawnedCharts={spawnedCharts}
        agentInsights={agentInsights}
        agentConfig={agentConfig}
        reportHistory={reportHistory}
        alerts={alerts}
        activeThought={activeThought}
        onUpdateConfig={onUpdateConfig}
        onSendReport={onSendReport}
        onRefreshInsights={onRefreshInsights}
      />
    </div>
  );
}
