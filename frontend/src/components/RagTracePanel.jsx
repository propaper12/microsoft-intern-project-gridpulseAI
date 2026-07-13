import { useState } from "react";
import { TRANSLATIONS } from "../utils/constants";
import { RAG_SCENARIO_PROMPTS } from "../utils/ragPrompts";

export default function RagTracePanel({
  lang,
  chatMessages,
  selectedTraceIndex,
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
  onQuickPrompt,
}) {
  const [configOpen, setConfigOpen] = useState(false);
  const activeIdx = selectedTraceIndex !== null ? selectedTraceIndex : chatMessages.length - 1;
  const activeMsg = chatMessages[activeIdx] || {};
  const msgText = activeMsg.textKey ? TRANSLATIONS[lang][activeMsg.textKey] || "" : activeMsg.text || "";
  const ragDetails = activeMsg.rag_details;

  return (
    <div className="rag-trace-panel">
      <div className="rag-sidebar-header">
        <h3>{lang === "TR" ? "RAG İzleyici" : "RAG Observer"}</h3>
        {ragDetails && <span className="badge-stable">LIVE</span>}
      </div>

      <div className="tab-bar tab-bar--compact">
        <button type="button" className={`tab-btn ${rightSidebarTab === "trace" ? "tab-btn--active" : ""}`} onClick={() => setRightSidebarTab("trace")}>
          Trace
        </button>
        <button type="button" className={`tab-btn ${rightSidebarTab === "scenarios" ? "tab-btn--active" : ""}`} onClick={() => setRightSidebarTab("scenarios")}>
          {lang === "TR" ? "Senaryo" : "Scenarios"}
        </button>
      </div>

      <div className="rag-sidebar-body">
        {rightSidebarTab === "trace" ? (
          <>
            <button type="button" className="rag-config-toggle" onClick={() => setConfigOpen(!configOpen)}>
              <span>{lang === "TR" ? "RAG Yapılandırma" : "RAG Config"}</span>
              <span>{configOpen ? "▲" : "▼"}</span>
            </button>
            {configOpen && (
              <div className="form-stack form-stack--compact">
                <label>
                  Model
                  <div className="rag-model-badge">
                    <span className="agent-model-dot" />
                    {ragModel}
                  </div>
                </label>
                <label>Temperature: <strong>{ragTemp}</strong>
                  <input type="range" min="0" max="1" step="0.1" value={ragTemp} onChange={(e) => setRagTemp(parseFloat(e.target.value))} />
                </label>
                <label>Graph: <strong>{ragDepth}-hop</strong>
                  <input type="range" min="1" max="3" step="1" value={ragDepth} onChange={(e) => setRagDepth(parseInt(e.target.value))} />
                </label>
              </div>
            )}

            <div className="trace-steps trace-steps--compact">
              {ragDetails ? (
                <>
                  <div className="trace-step trace-step--cyan">
                    <strong>1. Query</strong>
                    <code>"{(ragDetails.query || msgText).substring(0, 50)}..."</code>
                  </div>
                  <div className="trace-step trace-step--orange">
                    <strong>2. Vectors</strong>
                    <span>{ragDetails.retrieved_rules?.length || 0} rules · {ragDetails.metrics?.groundedness_score?.toFixed(0) || "—"}% grounded</span>
                  </div>
                  <div className="trace-step trace-step--purple">
                    <strong>3. GraphRAG</strong>
                    <span>{ragDetails.graph_context?.triplets?.length || 0} triplets</span>
                  </div>
                  <div className="trace-step trace-step--green">
                    <strong>4. Output</strong>
                    <span>{ragDetails.metrics?.total_latency_ms || "—"}ms</span>
                    {ragDetails.self_corrected && <span className="badge-warning">healed</span>}
                  </div>
                </>
              ) : (
                <div className="trace-placeholder">
                  <span className="trace-placeholder-icon">◈</span>
                  <p>{lang === "TR" ? "Sohbetten bir mesaj seçin veya sorgu gönderin." : "Select a chat message or send a query."}</p>
                </div>
              )}
            </div>

            <div className="obs-grid obs-grid--compact">
              <div className="obs-row"><span>Anomalies</span><strong className="text-red">{alerts.filter((a) => a.truth_score < 50).length}</strong></div>
              <div className="obs-row"><span>Rules</span><strong className="text-cyan">{dbRules.length || 10}</strong></div>
            </div>
          </>
        ) : (
          <div className="prompt-list">
            {RAG_SCENARIO_PROMPTS.map((p) => (
              <button
                key={p.label}
                type="button"
                className={`prompt-btn prompt-btn--${p.category}`}
                onClick={() => onQuickPrompt(lang === "TR" ? p.tr : p.en)}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
