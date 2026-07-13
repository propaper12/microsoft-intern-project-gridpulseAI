import GroundednessGauge from "../components/GroundednessGauge";
import RagGraphViz from "../components/RagGraphViz";

const CAPABILITIES = [
  {
    id: "rerank",
    TR: { title: "Keyword-Boost Reranker", desc: "Semantik vektör + anahtar kelime eşleşmesi birleştirilir." },
    EN: { title: "Keyword-Boost Reranker", desc: "Combines semantic vectors with exact keyword matches." },
    status: "active",
  },
  {
    id: "heal",
    TR: { title: "Self-Healing Query Expander", desc: "Düşük skor (<35%) durumunda sorgu genişletilir." },
    EN: { title: "Self-Healing Query Expander", desc: "Expands query when similarity score falls below 35%." },
    status: "conditional",
  },
  {
    id: "graph",
    TR: { title: "GraphRAG Local Search", desc: "SQLite bilgi grafiğinden 1-2 hop ilişki çözümü." },
    EN: { title: "GraphRAG Local Search", desc: "1-2 hop relation resolution from SQLite knowledge graph." },
    status: "active",
  },
  {
    id: "ground",
    TR: { title: "Groundedness Evaluator", desc: "Yanıt ile kaynaklar arası lexical overlap ölçümü." },
    EN: { title: "Groundedness Evaluator", desc: "Lexical overlap between reply and retrieved sources." },
    status: "active",
  },
];

function LatencyBar({ label, ms, total, color }) {
  const pct = total > 0 ? Math.max(4, (ms / total) * 100) : 0;
  return (
    <div className="latency-row">
      <span className="latency-label">{label}</span>
      <div className="latency-bar-bg">
        <div className="latency-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="latency-ms">{ms} ms</span>
    </div>
  );
}

function VectorPreview({ vector, lang }) {
  if (!vector?.length) return null;
  const slice = vector.slice(0, 24);
  const max = Math.max(...slice.map(Math.abs), 0.01);

  return (
    <div className="vector-preview">
      <div className="vector-bars">
        {slice.map((v, i) => (
          <div
            key={i}
            className="vector-bar"
            style={{ height: `${(Math.abs(v) / max) * 100}%`, background: v >= 0 ? "#3b9eff" : "#f59e0b" }}
            title={`dim ${i}: ${v.toFixed(4)}`}
          />
        ))}
      </div>
      <span className="vector-caption">
        {lang === "TR"
          ? `L2 normalize vektör · ilk ${slice.length} boyut · ${vector.length}D`
          : `L2 normalized · first ${slice.length} dims · ${vector.length}D`}
      </span>
    </div>
  );
}

export default function RagReportTab({ lang, selectedRagDetails, onBack }) {
  if (!selectedRagDetails) return null;

  const m = selectedRagDetails.metrics || {};
  const docId = `AUDIT-${Date.now().toString(36).toUpperCase()}`;
  const totalLatency = m.total_latency_ms || 1;
  const selfHealed = selectedRagDetails.self_corrected;

  return (
    <div className="rag-report">
      <div className="rag-report-toolbar no-print">
        <button type="button" className="btn-ghost" onClick={onBack}>
          ← {lang === "TR" ? "SCADA Merkezine Dön" : "Back to SCADA Center"}
        </button>
        <button type="button" className="btn-primary" onClick={() => window.print()}>
          {lang === "TR" ? "Yazdır / PDF" : "Print / PDF"}
        </button>
      </div>

      <div className="print-container rag-report-doc">
        {/* Belge başlığı */}
        <header className="rag-doc-header">
          <div>
            <h1 className="rag-doc-brand">GRIDPULSE.AI</h1>
            <p className="rag-doc-id">{docId} · {lang === "TR" ? "GİZLİ" : "CONFIDENTIAL"}</p>
          </div>
          <div className="rag-doc-meta">
            <div>{new Date().toLocaleString()}</div>
            <div>{selectedRagDetails.engine || "GridPulse RAG Engine"}</div>
          </div>
        </header>

        <h2 className="rag-doc-title">
          {lang === "TR" ? "RAG Co-Pilot Denetim ve Uyumluluk Raporu" : "RAG Co-Pilot Audit & Compliance Report"}
        </h2>

        {/* Özet satırı */}
        <div className="rag-summary-row">
          <GroundednessGauge score={m.groundedness_score} lang={lang} />
          <div className="rag-summary-metrics">
            <div className="rag-metric-card">
              <span className="rag-metric-label">{lang === "TR" ? "Toplam Gecikme" : "Total Latency"}</span>
              <span className="rag-metric-value">{m.total_latency_ms} ms</span>
            </div>
            <div className="rag-metric-card">
              <span className="rag-metric-label">{lang === "TR" ? "Taranan Satır" : "Rows Scanned"}</span>
              <span className="rag-metric-value">{m.scanned_rows || 0}</span>
            </div>
            <div className="rag-metric-card">
              <span className="rag-metric-label">{lang === "TR" ? "Token" : "Tokens"}</span>
              <span className="rag-metric-value">{m.token_stats?.total_tokens || "—"}</span>
            </div>
            <div className="rag-metric-card">
              <span className="rag-metric-label">{lang === "TR" ? "Self-Healing" : "Self-Healing"}</span>
              <span className={`rag-metric-value ${selfHealed ? "text-orange" : "text-green"}`}>
                {selfHealed ? (lang === "TR" ? "Evet" : "Yes") : (lang === "TR" ? "Hayır" : "No")}
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline latency */}
        <div className="panel rag-section">
          <div className="panel-header"><h3>{lang === "TR" ? "RAG Pipeline Gecikme Dağılımı" : "RAG Pipeline Latency Breakdown"}</h3></div>
          <LatencyBar label="Tokenization" ms={m.tokenization_time_ms || 0} total={totalLatency} color="#3b9eff" />
          <LatencyBar label="SQLite RAG" ms={m.sqlite_latency_ms || 0} total={totalLatency} color="#a78bfa" />
          <LatencyBar label="ClickHouse" ms={m.clickhouse_latency_ms || 0} total={totalLatency} color="#f59e0b" />
          <LatencyBar label="LLM Generation" ms={m.llm_latency_ms || 0} total={totalLatency} color="#22c55e" />
        </div>

        {/* Sorgu */}
        <div className="rag-two-col">
          <div className="panel rag-section">
            <div className="panel-header"><h3>{lang === "TR" ? "Kullanıcı Sorgusu" : "User Query"}</h3></div>
            <blockquote className="rag-query-block">"{selectedRagDetails.query}"</blockquote>
            {selectedRagDetails.expanded_query && (
              <div className="rag-expanded">
                <span className="badge-warning">{lang === "TR" ? "Genişletildi" : "Expanded"}</span>
                <p>"{selectedRagDetails.expanded_query}"</p>
              </div>
            )}
          </div>
          <div className="panel rag-section">
            <div className="panel-header"><h3>{lang === "TR" ? "AI Yanıt Özeti" : "AI Response Summary"}</h3></div>
            <p className="rag-reply-preview">{selectedRagDetails.reply?.substring(0, 400)}{(selectedRagDetails.reply?.length || 0) > 400 ? "..." : ""}</p>
          </div>
        </div>

        {/* Vektör + GraphRAG */}
        <div className="rag-two-col">
          <div className="panel rag-section">
            <div className="panel-header"><h3>{lang === "TR" ? "Sorgu Embedding Vektörü" : "Query Embedding Vector"}</h3></div>
            <VectorPreview vector={selectedRagDetails.query_vector} lang={lang} />
          </div>
          <div className="panel rag-section">
            <div className="panel-header"><h3>GraphRAG {lang === "TR" ? "Alt Graf" : "Subgraph"}</h3></div>
            <RagGraphViz graphContext={selectedRagDetails.graph_context} lang={lang} />
          </div>
        </div>

        {/* Kurallar */}
        <div className="panel rag-section">
          <div className="panel-header">
            <h3>{lang === "TR" ? "SQLite Vektör Arama Sonuçları" : "SQLite Vector Retrieval Results"}</h3>
            <span className="badge-stable">{selectedRagDetails.retrieved_rules?.length || 0} rules</span>
          </div>
          <div className="rag-rules-grid">
            {(selectedRagDetails.retrieved_rules || []).slice(0, 5).map((rule, i) => (
              <div key={i} className="rag-rule-card">
                <div className="rag-rule-header">
                  <strong>{rule.title || `Rule ${i + 1}`}</strong>
                  <span className={`badge-${rule.score >= 80 ? "stable" : rule.score >= 60 ? "warning" : "critical"}`}>
                    {rule.score}%
                  </span>
                </div>
                <p className="rag-rule-content">{rule.content?.substring(0, 180)}...</p>
                <div className="rag-rule-math">
                  <span>dot: {rule.dot_product}</span>
                  <span>||Q||: {rule.norm_q}</span>
                  <span>||R||: {rule.norm_r}</span>
                </div>
                {rule.shared_words?.length > 0 && (
                  <div className="rag-shared-words">
                    {rule.shared_words.slice(0, 6).map((w) => (
                      <span key={w} className="rag-word-chip">{w}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Anomaliler */}
        {(selectedRagDetails.active_anomalies?.length || 0) > 0 && (
          <div className="panel rag-section">
            <div className="panel-header"><h3>{lang === "TR" ? "ClickHouse Canlı Anomaliler" : "ClickHouse Live Anomalies"}</h3></div>
            <table className="data-table rag-anomaly-table">
              <thead>
                <tr>
                  <th>{lang === "TR" ? "Cihaz" : "Device"}</th>
                  <th>{lang === "TR" ? "Şehir" : "City"}</th>
                  <th>{lang === "TR" ? "Neden" : "Reason"}</th>
                  <th>{lang === "TR" ? "Kararlılık" : "Stability"}</th>
                </tr>
              </thead>
              <tbody>
                {selectedRagDetails.active_anomalies.map((a, i) => (
                  <tr key={i}>
                    <td>{a.device_id}</td>
                    <td>{a.city}</td>
                    <td className="text-red">{a.reason}</td>
                    <td>{a.stability_score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* RAG yetenekleri */}
        <div className="panel rag-section">
          <div className="panel-header"><h3>{lang === "TR" ? "RAG Motor Yetenekleri" : "RAG Engine Capabilities"}</h3></div>
          <div className="rag-capabilities">
            {CAPABILITIES.map((cap) => {
              const t = cap[lang];
              const active = cap.status === "active" || (cap.status === "conditional" && selfHealed);
              return (
                <div key={cap.id} className={`rag-cap-card ${active ? "rag-cap-card--active" : ""}`}>
                  <strong>{t.title}</strong>
                  <p>{t.desc}</p>
                  <span className={active ? "badge-stable" : "badge-warning"}>
                    {active ? "✓ ACTIVE" : "STANDBY"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* System prompt */}
        {selectedRagDetails.system_prompt && (
          <details className="panel rag-section rag-prompt-details">
            <summary>{lang === "TR" ? "Augmented System Prompt (tam payload)" : "Augmented System Prompt (full payload)"}</summary>
            <pre className="code-block">{selectedRagDetails.system_prompt}</pre>
          </details>
        )}

        <footer className="rag-doc-footer">
          GridPulseAI RAG Audit · {docId} · {lang === "TR" ? "Bu rapor otomatik üretilmiştir." : "This report was auto-generated."}
        </footer>
      </div>
    </div>
  );
}
