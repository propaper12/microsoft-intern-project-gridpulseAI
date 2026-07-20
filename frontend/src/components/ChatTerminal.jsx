import { useCallback, useMemo } from "react";
import { TRANSLATIONS } from "../utils/constants";
import { CHAT_QUICK_PROMPTS } from "../utils/ragPrompts";
import { useAgentVoice } from "../hooks/useAgentVoice";

function MicIcon({ listening }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
      <path d="M19 11a7 7 0 0 1-14 0" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
      {listening ? <circle cx="12" cy="18.5" r="1.8" fill="currentColor" stroke="none" /> : null}
    </svg>
  );
}

function SpeakerIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      {active ? <circle cx="19" cy="6" r="1.6" fill="currentColor" stroke="none" /> : null}
    </svg>
  );
}

function AgentVoiceIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <path d="M12 18v4" />
      <path d="M8 22h8" />
      {active ? <circle cx="18" cy="6" r="2" fill="currentColor" stroke="none" /> : null}
    </svg>
  );
}

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
  const voiceRecognitionCtor = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);
  const voiceSupported = !!voiceRecognitionCtor;

  const ttsSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
  }, []);

  const getMessageText = useCallback(
    (msg) => (msg.textKey ? TRANSLATIONS[lang]?.[msg.textKey] : msg.text),
    [lang]
  );

  const {
    agentVoiceMode,
    toggleAgentVoiceMode,
    continuousDialog,
    setContinuousDialog,
    ttsEnabled,
    setTtsEnabled,
    isListening,
    agentPhase,
    handleMicClick,
    statusHint,
  } = useAgentVoice({
    lang,
    voiceSupported,
    voiceRecognitionCtor,
    ttsSupported,
    onSubmit,
    setChatInput,
    chatMessages,
    getMessageText,
  });

  const micBusy = agentVoiceMode && (agentPhase === "thinking" || agentPhase === "speaking");
  const showClassicTts = ttsSupported && !agentVoiceMode;

  return (
    <div className={`panel chat-terminal ${agentVoiceMode ? "chat-terminal--agent-voice" : ""}`}>
      <div className="panel-header chat-terminal-header">
        <div className="chat-terminal-header__title">
          <h3>GridPulse AI Terminal</h3>
          <span className="panel-hint">
            {lang === "TR" ? "Mesaja tıklayın → RAG trace sağ panelde güncellenir" : "Click a message → RAG trace updates in the right panel"}
          </span>
        </div>
        <div className="chat-terminal-header__actions">
          {voiceSupported && (
            <button
              type="button"
              className={`btn-agent-voice ${agentVoiceMode ? "btn-agent-voice--on" : ""}`}
              onClick={toggleAgentVoiceMode}
              aria-pressed={agentVoiceMode}
              title={agentVoiceMode ? TRANSLATIONS[lang].voice_agent_mode : TRANSLATIONS[lang].voice_agent_mode_off}
            >
              <AgentVoiceIcon active={agentVoiceMode} />
              <span>{TRANSLATIONS[lang].voice_agent_mode}</span>
            </button>
          )}
        </div>
      </div>

      {agentVoiceMode && (
        <div className="agent-voice-bar">
          <label className="agent-voice-bar__continuous">
            <input
              type="checkbox"
              checked={continuousDialog}
              onChange={(e) => setContinuousDialog(e.target.checked)}
            />
            <span>{TRANSLATIONS[lang].voice_continuous}</span>
          </label>
          <span className={`agent-voice-bar__pulse ${agentPhase !== "idle" || isListening ? "agent-voice-bar__pulse--live" : ""}`} />
        </div>
      )}

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
            disabled={agentVoiceMode && micBusy}
          >
            {p.label}
          </button>
        ))}
      </div>

      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!chatInput.trim() || micBusy) return;
          onSubmit(chatInput);
          setChatInput("");
        }}
      >
        <input
          className="chat-input"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={TRANSLATIONS[lang].copilot_placeholder}
          disabled={agentVoiceMode && micBusy}
        />
        <button
          type="button"
          className={`voice-btn ${isListening ? "voice-btn--listening" : ""} ${agentVoiceMode ? "voice-btn--agent-mode" : ""}`}
          onClick={handleMicClick}
          disabled={!voiceSupported || micBusy}
          aria-label={lang === "TR" ? "Sesli konuşma" : "Voice input"}
          title={
            agentVoiceMode
              ? TRANSLATIONS[lang].voice_agent_mode
              : isListening
                ? TRANSLATIONS[lang].voice_listening
                : TRANSLATIONS[lang].voice_mic
          }
        >
          <MicIcon listening={isListening} />
        </button>
        {showClassicTts && (
          <button
            type="button"
            className={`voice-btn ${ttsEnabled ? "voice-btn--active" : ""}`}
            onClick={() => setTtsEnabled((v) => !v)}
            aria-label={TRANSLATIONS[lang].tts_toggle}
            title={TRANSLATIONS[lang].tts_toggle}
          >
            <SpeakerIcon active={ttsEnabled} />
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={agentVoiceMode && micBusy}>
          {TRANSLATIONS[lang].copilot_send}
        </button>
      </form>

      {statusHint ? (
        <div
          className={`voice-hint ${agentVoiceMode ? "voice-hint--agent" : ""} ${
            agentPhase === "thinking" ? "voice-hint--thinking" : ""
          } ${isListening ? "voice-hint--listening" : ""}`}
        >
          {statusHint}
        </div>
      ) : null}
    </div>
  );
}
