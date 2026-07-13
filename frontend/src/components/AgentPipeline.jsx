const STEPS = [
  { key: "scan", TR: "Tarama", EN: "Scan", icon: "◎" },
  { key: "rag", TR: "RAG", EN: "RAG", icon: "◈" },
  { key: "decide", TR: "Karar", EN: "Decide", icon: "◆" },
  { key: "act", TR: "Aksiyon", EN: "Act", icon: "▶" },
];

function activeStepIndex(status, active) {
  if (!active && status === "SAFE") return -1;
  if (status === "OVERRIDING") return 3;
  if (status === "DIAGNOSING") return 1;
  if (active) return 2;
  return 0;
}

export default function AgentPipeline({ lang, agentStatus, agentActive }) {
  const activeIdx = activeStepIndex(agentStatus, agentActive);

  return (
    <div className="agent-pipeline">
      {STEPS.map((step, i) => {
        const state = i < activeIdx ? "done" : i === activeIdx ? "active" : "idle";
        return (
          <div key={step.key} className={`pipeline-step pipeline-step--${state}`}>
            <div className="pipeline-step-icon">{step.icon}</div>
            <span className="pipeline-step-label">{step[lang]}</span>
            {i < STEPS.length - 1 && <div className={`pipeline-connector ${i < activeIdx ? "pipeline-connector--done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

function colorizeLog(line) {
  if (line.includes("[SYS]")) return "log-sys";
  if (line.includes("[VISION]") || line.includes("Grafik okundu") || line.includes("👁")) return "log-vision";
  if (line.includes("[REPORT]") || line.includes("📧")) return "log-report";
  if (line.includes("[STEP]") || line.includes("[AUTOPILOT]") || line.includes("[AGENT]")) return "log-step";
  if (line.includes("KESİNTİ") || line.includes("OUTAGE") || line.includes("🔴")) return "log-error";
  if (line.includes("CRITICAL") || line.includes("ERROR") || line.includes("ANOMALY")) return "log-error";
  if (line.includes("SAFE") || line.includes("OK")) return "log-ok";
  return "log-default";
}

export { colorizeLog };
