import ChatTerminal from "../components/ChatTerminal";
import RagTracePanel from "../components/RagTracePanel";
import { GRIDPULSE_MODEL } from "../utils/constants";

export default function GridCopilotTab({
  lang,
  systemStatus,
  chatMessages,
  chatInput,
  setChatInput,
  selectedTraceIndex,
  setSelectedTraceIndex,
  handleChatSubmit,
  setSelectedRagDetails,
  setActiveTab,
  ragModel,
  ragTemp,
  setRagTemp,
  ragDepth,
  setRagDepth,
  rightSidebarTab,
  setRightSidebarTab,
  alerts,
  dbRules,
  gridLoadCoeff,
  solarRadiation,
  agentActive,
}) {
  return (
    <div className="grid-copilot-page">
      <div className="content-header copilot-page-header">
        <div>
          <h2>{lang === "TR" ? "Grid AI Copilot" : "Grid AI Copilot"}</h2>
          <p className="copilot-page-subtitle">
            {lang === "TR"
              ? "RAG destekli şebeke asistanı — soru sor, kural eşleşmesini ve GraphRAG izini canlı izle"
              : "RAG-powered grid assistant — ask questions, watch rule matching and GraphRAG trace live"}
          </p>
        </div>
        <div className="copilot-page-badges">
          <span className={`badge-stable ${systemStatus.ollama === "ONLINE" ? "" : "badge-warning"}`}>
            {systemStatus.ollama === "ONLINE" ? `Ollama · ${GRIDPULSE_MODEL}` : "Ollama Offline"}
          </span>
          <span className={`badge-stable ${systemStatus.sqlite_rag === "ONLINE" ? "" : "badge-warning"}`}>
            RAG {systemStatus.sqlite_rag === "ONLINE" ? "Online" : "Offline"}
          </span>
          {agentActive && (
            <span className="badge-stable">
              <span className="live-dot" style={{ marginRight: 6 }} />
              Agent {lang === "TR" ? "Aktif" : "Active"}
            </span>
          )}
          <button type="button" className="btn-ghost btn-sm" onClick={() => setActiveTab("ai_brain")}>
            {lang === "TR" ? "← SCADA Merkezi" : "← SCADA Center"}
          </button>
        </div>
      </div>

      <div className="copilot-layout">
        <div className="copilot-chat-pane">
          <ChatTerminal
            lang={lang}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            selectedTraceIndex={selectedTraceIndex}
            setSelectedTraceIndex={setSelectedTraceIndex}
            onSubmit={handleChatSubmit}
            onQuickPrompt={handleChatSubmit}
            onRagReport={(details) => {
              setSelectedRagDetails(details);
              setActiveTab("rag_report");
            }}
          />
        </div>

        <aside className="copilot-rag-pane">
          <RagTracePanel
            lang={lang}
            chatMessages={chatMessages}
            selectedTraceIndex={selectedTraceIndex}
            ragModel={ragModel}
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
            onQuickPrompt={handleChatSubmit}
          />
        </aside>
      </div>
    </div>
  );
}
