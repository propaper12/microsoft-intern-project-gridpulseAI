import { TRANSLATIONS } from "../utils/constants";
import { CHAT_QUICK_PROMPTS } from "../utils/ragPrompts";

export default function ChatTerminal({
  lang,
  chatMessages,
  chatInput,
  setChatInput,
  selectedTraceIndex,
  setSelectedTraceIndex,
  onSubmit,
  onQuickPrompt,
  onRagReport,
}) {
  return (
    <div className="panel chat-terminal">
      <div className="panel-header">
        <h3>GridPulse AI Terminal</h3>
        <span className="panel-hint">
          {lang === "TR" ? "Mesaja tıklayın → RAG trace sağ panelde güncellenir" : "Click a message → RAG trace updates in the right panel"}
        </span>
      </div>

      <div className="chat-feed">
        {chatMessages.map((msg, idx) => {
          const isSelected = selectedTraceIndex === idx || (selectedTraceIndex === null && idx === chatMessages.length - 1);
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`chat-bubble ${isUser ? "chat-bubble--user" : "chat-bubble--ai"} ${isSelected ? "chat-bubble--selected" : ""}`}
              onClick={() => setSelectedTraceIndex(idx)}
            >
              <span>{msg.textKey ? TRANSLATIONS[lang][msg.textKey] : msg.text}</span>
              <div className="chat-bubble-meta">
                <span>{isUser ? (lang === "TR" ? "Kullanıcı" : "User") : msg.engine || "Grid AI"}</span>
                {!isUser && msg.rag_details?.report_mode && (
                  <span className="badge-stable">rapor</span>
                )}
                {!isUser && msg.rag_details?.self_corrected && (
                  <span className="badge-warning">self-healed</span>
                )}
                {!isUser && msg.rag_details && (
                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRagReport?.({
                        ...msg.rag_details,
                        reply: msg.text,
                        engine: msg.engine,
                      });
                    }}
                  >
                    RAG Raporu
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-quick-prompts">
        {CHAT_QUICK_PROMPTS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`chat-prompt-chip chat-prompt-chip--${p.style}`}
            onClick={() => onQuickPrompt?.(lang === "TR" ? p.tr : p.en)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!chatInput.trim()) return;
          onSubmit(chatInput);
          setChatInput("");
        }}
      >
        <input
          className="chat-input"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={TRANSLATIONS[lang].copilot_placeholder}
        />
        <button type="submit" className="btn-primary">
          {TRANSLATIONS[lang].copilot_send}
        </button>
      </form>
    </div>
  );
}
