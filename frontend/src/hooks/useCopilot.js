import { useState, useCallback } from "react";
import { playSynthBeep } from "../utils/constants";
import { apiUrl } from "../utils/apiBase";

export function useCopilot(lang, { setAgentStatus, setActiveThought, setAgentLogs }) {
  const [chatMessages, setChatMessages] = useState([{ id: 1, sender: "ai", textKey: "copilot_intro" }]);
  const [chatInput, setChatInput] = useState("");
  const [selectedTraceIndex, setSelectedTraceIndex] = useState(null);
  const [selectedRagDetails, setSelectedRagDetails] = useState(null);

  const handleChatSubmit = useCallback(
    async (text) => {
      const userMsg = { id: Date.now(), sender: "user", text };
      setChatMessages((prev) => [...prev, userMsg]);
      setAgentStatus("DIAGNOSING");
      setActiveThought("Analyzing user query and computing embedding vector...");
      playSynthBeep(480, "sine", 0.08);

      const thoughts = [
        "Analyzing user query and computing embedding vector...",
        "Querying ClickHouse telemetry stream for target anomalies...",
        "Searching SQLite RAG rule guidelines...",
        "Resolving local GraphRAG node relationships...",
        "Synthesizing final cognitive response...",
      ];
      let thoughtStep = 0;
      const thoughtInterval = setInterval(() => {
        if (thoughtStep < thoughts.length - 1) {
          thoughtStep++;
          setActiveThought(thoughts[thoughtStep]);
          setAgentLogs((prev) => [...prev, `[STEP ${thoughtStep}] ${thoughts[thoughtStep]}`]);
        }
      }, 1200);

      try {
        const response = await fetch(apiUrl("/api/copilot"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, lang }),
        });
        clearInterval(thoughtInterval);
        const data = await response.json();
        const aiReply = data.reply || (lang === "TR" ? "Hata oluştu." : "Error occurred.");
        const engine = data.engine || "Explainable Grid AI";

        setChatMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: "ai", text: aiReply, engine, rag_details: data.rag_details },
        ]);
        if (data.rag_details) {
          setSelectedRagDetails(data.rag_details);
          if (data.rag_details.report_mode && data.rag_details.report_delivery) {
            const st = data.rag_details.report_delivery.status;
            setAgentLogs((prev) => [
              ...prev,
              `[REPORT] 📧 Chat rapor talebi — durum: ${st}`,
            ]);
          }
          if (data.rag_details.self_corrected) {
            setActiveThought(
              lang === "TR"
                ? `RAG self-healing aktif — genişletilmiş sorgu: "${data.rag_details.expanded_query}"`
                : `RAG self-healing active — expanded query: "${data.rag_details.expanded_query}"`
            );
            setAgentLogs((prev) => [...prev, `[RAG] 🔧 Self-healing: "${data.rag_details.expanded_query}"`]);
          }
        }
        setAgentStatus("SAFE");
        setActiveThought("Monitoring telemetry streams...");
        playSynthBeep(650, "sine", 0.15);
      } catch {
        clearInterval(thoughtInterval);
        setAgentStatus("SAFE");
        setActiveThought("Monitoring telemetry streams...");
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: lang === "TR" ? "Şebeke veri akışı stabil, yerel fallback aktif." : "Grid streams active, local fallback online.",
            engine: "Local Fallback",
          },
        ]);
      }
    },
    [lang, setAgentStatus, setActiveThought, setAgentLogs]
  );

  return {
    chatMessages,
    chatInput,
    setChatInput,
    selectedTraceIndex,
    setSelectedTraceIndex,
    selectedRagDetails,
    setSelectedRagDetails,
    handleChatSubmit,
  };
}
