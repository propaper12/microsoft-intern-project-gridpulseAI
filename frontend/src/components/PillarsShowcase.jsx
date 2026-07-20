const PILLARS = {
  TR: [
    {
      id: "telemetry",
      icon: "📡",
      title: "Anlık Veri",
      subtitle: "Live Telemetry",
      desc: "Kafka · ClickHouse · SSE ile trafo, sayaç ve EV şarj istasyonlarından gerçek zamanlı telemetri akışı.",
      tags: ["Redpanda", "ClickHouse", "SSE"],
      accent: "cyan",
    },
    {
      id: "agent",
      icon: "🤖",
      title: "Otonom Agent",
      subtitle: "Autonomous Agent",
      desc: "llama3.2:1b ile telemetriyi analiz eder, grafik üretir, kritik durumlarda operatöre e-posta raporu gönderir — siz müdahale etmeden.",
      tags: ["Autopilot", "E-posta Rapor", "Rule 101–110"],
      accent: "green",
    },
    {
      id: "rag",
      icon: "◈",
      title: "GraphRAG",
      subtitle: "Explainable AI",
      desc: "SQLite vektör arama + GraphRAG ile SCADA kurallarına dayalı, groundedness skorlu açıklanabilir AI yanıtları.",
      tags: ["Vector RAG", "GraphRAG", "Self-Heal"],
      accent: "purple",
    },
  ],
  EN: [
    {
      id: "telemetry",
      icon: "📡",
      title: "Live Telemetry",
      subtitle: "Real-Time Data",
      desc: "Real-time telemetry from transformers, meters and EV chargers via Kafka, ClickHouse and SSE streams.",
      tags: ["Redpanda", "ClickHouse", "SSE"],
      accent: "cyan",
    },
    {
      id: "agent",
      icon: "🤖",
      title: "Autonomous Agent",
      subtitle: "Self-Managing",
      desc: "Analyzes telemetry with llama3.2:1b, spawns charts, and emails ops reports on critical events — without manual intervention.",
      tags: ["Autopilot", "Email Reports", "Rule 101–110"],
      accent: "green",
    },
    {
      id: "rag",
      icon: "◈",
      title: "GraphRAG",
      subtitle: "Explainable AI",
      desc: "SQLite vector search + GraphRAG for SCADA rule-grounded, groundedness-scored explainable AI responses.",
      tags: ["Vector RAG", "GraphRAG", "Self-Heal"],
      accent: "purple",
    },
  ],
};

export default function PillarsShowcase({
  lang,
  compact = false,
  activePillar = null,
  agentActive = false,
  variant = "default",
}) {
  const pillars = PILLARS[lang] || PILLARS.TR;
  const isMarketing = variant === "marketing";

  return (
    <div
      className={`pillars-showcase ${compact ? "pillars-showcase--compact" : ""} ${
        isMarketing ? "pillars-showcase--marketing" : ""
      }`}
    >
      {pillars.map((p) => {
        const isActive = activePillar === p.id || (p.id === "agent" && agentActive);
        return (
          <div
            key={p.id}
            className={`pillar-card pillar-card--${p.accent} ${isActive ? "pillar-card--active" : ""} ${
              isMarketing ? "pillar-card--marketing" : ""
            }`}
          >
            <div className="pillar-card-top">
              <span className="pillar-icon">{p.icon}</span>
              <div>
                <strong>{p.title}</strong>
                <span className="pillar-subtitle">{p.subtitle}</span>
              </div>
              {isActive && p.id === "agent" && <span className="live-dot pillar-live" />}
            </div>
            {!compact && <p className="pillar-desc">{p.desc}</p>}
            <div className="pillar-tags">
              {p.tags.map((t) => (
                <span key={t} className="pillar-tag">{t}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
