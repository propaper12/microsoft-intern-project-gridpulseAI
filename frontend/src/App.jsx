import React, { useState, useEffect } from "react";
import "./index.css";
import "./styles/app-shell.css";

import LandingPage from "./components/LandingPage";
import ServiceLEDs from "./components/ServiceLEDs";
import AgentHUD from "./components/AgentHUD";
import DashboardTab from "./tabs/DashboardTab";
import AIControlRoom from "./tabs/AIControlRoom";
import GridCopilotTab from "./tabs/GridCopilotTab";
import AnomaliesTab from "./tabs/AnomaliesTab";
import RagReportTab from "./tabs/RagReportTab";

import { TRANSLATIONS, gridStations, playSynthBeep, GRIDPULSE_MODEL } from "./utils/constants";
import { apiUrl } from "./utils/apiBase";
import { useSSEStream } from "./hooks/useSSEStream";
import { useAgentPolling } from "./hooks/useAgentPolling";
import { useCopilot } from "./hooks/useCopilot";

function App() {
  const [lang, setLang] = useState("TR");
  const [isOnLandingPage, setIsOnLandingPage] = useState(true);
  const [activeTab, setActiveTab] = useState("ai_brain");
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [revertedIds, setRevertedIds] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dbRules, setDbRules] = useState([]);
  const [systemStatus, setSystemStatus] = useState({ clickhouse: "OFFLINE", redpanda: "OFFLINE", sqlite_rag: "OFFLINE", ollama: "OFFLINE" });
  const [ragTemp, setRagTemp] = useState(0.2);
  const [ragDepth, setRagDepth] = useState(2);
  const [rightSidebarTab, setRightSidebarTab] = useState("trace");
  const [gridLoadCoeff, setGridLoadCoeff] = useState(1.0);
  const [solarRadiation, setSolarRadiation] = useState(500);
  const [activeThought, setActiveThought] = useState("Monitoring telemetry streams...");

  const { alerts, setAlerts, avgTruth, timeline, breakdown } = useSSEStream();

  const {
    spawnedCharts,
    agentStatus,
    agentLogs,
    setAgentLogs,
    agentInsights,
    model,
    isActive: agentActive,
    setAgentStatus,
    agentError,
    agentConfig,
    reportHistory,
    startAgent,
    stopAgent,
    updateConfig,
    sendReportNow,
    refreshInsights,
  } = useAgentPolling(true);

  const {
    chatMessages,
    chatInput,
    setChatInput,
    selectedTraceIndex,
    setSelectedTraceIndex,
    selectedRagDetails,
    setSelectedRagDetails,
    handleChatSubmit,
  } = useCopilot(lang, { setAgentStatus, setActiveThought, setAgentLogs });

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetch(apiUrl("/api/rules"))
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setDbRules(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchStatus = () => {
      fetch(apiUrl("/api/status"))
        .then((r) => r.json())
        .then((data) => { if (data?.sqlite_rag) setSystemStatus(data); })
        .catch(() => {});
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (alerts.length > 0) {
      const totalLoadScale = alerts.reduce((acc, a) => {
        let scale = 1.0;
        if (a.reason === "CRITICAL_OVERLOAD" || a.reason === "OVERLOAD") scale = 1.45;
        else if (a.reason === "OVERHEATING") scale = 1.15;
        else if (a.reason === "VOLTAGE_DROP") scale = 0.95;
        return acc + scale;
      }, 0);
      setGridLoadCoeff(parseFloat((totalLoadScale / alerts.length).toFixed(2)));
      const avgTemp = alerts.reduce((acc, a) => acc + (a.temp || 22), 0) / alerts.length;
      setSolarRadiation(Math.min(1000, Math.max(0, Math.round((avgTemp - 12) * 38))));
    }
  }, [alerts]);

  const handleRevert = (row) => {
    const rowKey = `${row.account_id}-${row.hashtag}-${row.timestamp}`;
    setRevertedIds((prev) => [...prev, rowKey]);
    setAlerts((prev) => [
      {
        account_id: "SYSTEM_DAEMON",
        hashtag: row.hashtag,
        post_text: `ADMIN: Isolated device '${row.account_id}'`,
        city: row.city,
        reason: "REVERTED",
        truth_score: 100,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    playSynthBeep(523, "sine", 0.1);
  };

  const criticalAlerts = alerts.filter(
    (a) => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`)
  );

  if (isOnLandingPage) {
    return (
      <LandingPage
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        onLaunch={() => setIsOnLandingPage(false)}
      />
    );
  }

  const t = TRANSLATIONS[lang];

  const topbarPages = {
    analytics: { title: t.tab_dashboard, sub: lang === "TR" ? "Canlı telemetri ve KPI" : "Live telemetry & KPIs" },
    ai_brain: { title: t.tab_ai, sub: lang === "TR" ? "Otonom grafik tuvali" : "Autonomous chart canvas" },
    copilot: { title: t.tab_copilot, sub: lang === "TR" ? "RAG sohbet ve iz sürme" : "RAG chat & trace" },
    threats: { title: t.tab_anomalies, sub: lang === "TR" ? "Anomali yönetimi" : "Anomaly management" },
    rag_report: { title: lang === "TR" ? "RAG Raporu" : "RAG Report", sub: lang === "TR" ? "Detaylı iz dökümü" : "Detailed trace export" },
  };
  const topbar = topbarPages[activeTab] || topbarPages.ai_brain;

  return (
    <div className={`dashboard app-shell ${darkMode ? "dark" : ""}`}>
      <div className="app-shell-grid-bg" aria-hidden="true" />
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-logo" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} role="button" tabIndex={0}>
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </div>
          {!sidebarCollapsed && <span>GridPulse.AI</span>}
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-primary">
            {!sidebarCollapsed && (
              <div className="sidebar-section-label">{lang === "TR" ? "Konsol" : "Console"}</div>
            )}
            <button type="button" className={`nav-item ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
              {!sidebarCollapsed && <span>{t.tab_dashboard}</span>}
            </button>
            <button type="button" className={`nav-item ${activeTab === "ai_brain" ? "active" : ""}`} onClick={() => setActiveTab("ai_brain")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              {!sidebarCollapsed && <span>{t.tab_ai}</span>}
            </button>
            <button type="button" className={`nav-item ${activeTab === "copilot" ? "active" : ""}`} onClick={() => setActiveTab("copilot")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              {!sidebarCollapsed && <span>{t.tab_copilot}</span>}
            </button>
            <button type="button" className={`nav-item ${activeTab === "threats" ? "active" : ""}`} onClick={() => setActiveTab("threats")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              {!sidebarCollapsed && <span>{t.tab_anomalies}</span>}
            </button>
          </div>
          <div className="sidebar-nav-footer">
            <button type="button" className="nav-item nav-item--exit" onClick={() => setIsOnLandingPage(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
              {!sidebarCollapsed && <span>{lang === "TR" ? "Portala Dön" : "Exit Portal"}</span>}
            </button>
            {!sidebarCollapsed && (
              <div className="sidebar-env-pill">v1 · {lang === "TR" ? "Demo ortam" : "Demo env"}</div>
            )}
          </div>
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-title">
            <h1 className="app-topbar-page">{topbar.title}</h1>
            <span className="app-topbar-sub">{topbar.sub}</span>
            <ServiceLEDs systemStatus={systemStatus} />
          </div>
          <div className="topbar-actions">
            <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="TR">TR</option>
              <option value="EN">EN</option>
            </select>
            <button type="button" className="icon-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
              {darkMode ? "☀" : "☾"}
            </button>
            <button type="button" className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
              <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              {criticalAlerts.length > 0 && <span className="badge-dot" />}
            </button>
            {showNotifications && (
              <div className="notifications-dropdown">
                <strong>{lang === "TR" ? "Bildirimler" : "Notifications"}</strong>
                {criticalAlerts.slice(0, 4).map((n, idx) => (
                  <button key={idx} type="button" className="notification-item" onClick={() => { setActiveTab("threats"); setShowNotifications(false); }}>
                    <span className="text-red">{n.reason}</span>
                    <span>{n.account_id}</span>
                  </button>
                ))}
                {criticalAlerts.length === 0 && <p className="text-muted">{lang === "TR" ? "Yeni bildirim yok" : "No new notifications"}</p>}
              </div>
            )}
          </div>
        </header>

        <div className="content">
          {activeTab === "analytics" && (
            <DashboardTab lang={lang} alerts={alerts} avgTruth={avgTruth} timeline={timeline} breakdown={breakdown} revertedIds={revertedIds} />
          )}
          {activeTab === "ai_brain" && (
            <AIControlRoom
              lang={lang}
              systemStatus={systemStatus}
              setActiveTab={setActiveTab}
              alerts={alerts}
              spawnedCharts={spawnedCharts}
              agentActive={agentActive}
              agentStatus={agentStatus}
              agentLogs={agentLogs}
              agentInsights={agentInsights}
              agentConfig={agentConfig}
              reportHistory={reportHistory}
              activeThought={activeThought}
              onUpdateConfig={updateConfig}
              onSendReport={sendReportNow}
              onRefreshInsights={() => refreshInsights(lang)}
            />
          )}
          {activeTab === "copilot" && (
            <GridCopilotTab
              lang={lang}
              systemStatus={systemStatus}
              chatMessages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              selectedTraceIndex={selectedTraceIndex}
              setSelectedTraceIndex={setSelectedTraceIndex}
              handleChatSubmit={handleChatSubmit}
              setSelectedRagDetails={setSelectedRagDetails}
              setActiveTab={setActiveTab}
              ragModel={model}
              ragTemp={ragTemp}
              setRagTemp={setRagTemp}
              ragDepth={ragDepth}
              setRagDepth={setRagDepth}
              rightSidebarTab={rightSidebarTab}
              setRightSidebarTab={setRightSidebarTab}
              alerts={alerts}
              dbRules={dbRules}
              gridLoadCoeff={gridLoadCoeff}
              solarRadiation={solarRadiation}
              agentActive={agentActive}
            />
          )}
          {activeTab === "threats" && (
            <AnomaliesTab
              lang={lang}
              alerts={alerts}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              revertedIds={revertedIds}
              onRevert={handleRevert}
              onReview={setSelectedAlert}
            />
          )}
          {activeTab === "rag_report" && (
            <RagReportTab lang={lang} selectedRagDetails={selectedRagDetails} onBack={() => setActiveTab("copilot")} />
          )}
        </div>
      </main>

      <AgentHUD
        lang={lang}
        sidebarCollapsed={sidebarCollapsed}
        agentActive={agentActive}
        agentStatus={agentStatus}
        activeThought={activeThought}
        setActiveThought={setActiveThought}
        agentLogs={agentLogs}
        spawnedCount={spawnedCharts.length}
        agentError={agentError}
        onStart={startAgent}
        onStop={stopAgent}
      />

      {selectedAlert && (
        <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <h3>{lang === "TR" ? "Teşhis Raporu" : "Diagnostic Report"}</h3>
              <button type="button" className="btn-ghost" onClick={() => setSelectedAlert(null)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>{lang === "TR" ? "Cihaz" : "Device"}:</strong> {selectedAlert.hashtag} — {selectedAlert.account_id}</p>
              <p><strong>{lang === "TR" ? "Konum" : "Location"}:</strong> {gridStations[selectedAlert.city] || selectedAlert.city}</p>
              <p><strong>{lang === "TR" ? "Kararlılık" : "Stability"}:</strong> <span className="text-red">{selectedAlert.truth_score}%</span></p>
              <p><strong>{lang === "TR" ? "Neden" : "Reason"}:</strong> {selectedAlert.reason}</p>
              <p className="text-muted">{selectedAlert.fact_check_result || selectedAlert.post_text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
