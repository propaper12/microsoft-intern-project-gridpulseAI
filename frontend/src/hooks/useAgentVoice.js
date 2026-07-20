import { useCallback, useEffect, useRef, useState } from "react";
import { TRANSLATIONS } from "../utils/constants";

/**
 * Conversational voice loop for Grid Copilot: listen → auto-submit → TTS reply → optional re-listen.
 */
export function useAgentVoice({
  lang,
  voiceSupported,
  voiceRecognitionCtor,
  ttsSupported,
  onSubmit,
  setChatInput,
  chatMessages,
  getMessageText,
}) {
  const [agentVoiceMode, setAgentVoiceMode] = useState(false);
  const [continuousDialog, setContinuousDialog] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [agentPhase, setAgentPhase] = useState("idle"); // idle | listening | thinking | speaking
  const [voiceErrorHint, setVoiceErrorHint] = useState("");

  const recognitionRef = useRef(null);
  const voiceFinalTranscriptRef = useRef("");
  const lastSpokenMessageIdRef = useRef(null);
  const agentVoiceModeRef = useRef(false);
  const continuousDialogRef = useRef(true);
  const pendingVoiceReplyRef = useRef(false);
  const startListeningRef = useRef(() => {});

  useEffect(() => {
    agentVoiceModeRef.current = agentVoiceMode;
  }, [agentVoiceMode]);

  useEffect(() => {
    continuousDialogRef.current = continuousDialog;
  }, [continuousDialog]);

  const cancelTts = useCallback(() => {
    if (ttsSupported && typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
    setAgentPhase((p) => (p === "speaking" ? "idle" : p));
  }, [ttsSupported]);

  const speakText = useCallback(
    (text) =>
      new Promise((resolve) => {
        if (!ttsSupported || !text?.trim()) {
          resolve();
          return;
        }
        try {
          window.speechSynthesis.cancel();
          const utterance = new window.SpeechSynthesisUtterance(text);
          utterance.lang = lang === "TR" ? "tr-TR" : "en-US";
          utterance.rate = 1;
          utterance.onend = () => {
            setAgentPhase((p) => (p === "speaking" ? "idle" : p));
            resolve();
          };
          utterance.onerror = () => {
            setAgentPhase((p) => (p === "speaking" ? "idle" : p));
            resolve();
          };
          setAgentPhase("speaking");
          window.speechSynthesis.speak(utterance);
        } catch {
          resolve();
        }
      }),
    [ttsSupported, lang]
  );

  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const handleVoiceEnd = useCallback(
    async (finalText) => {
      if (!agentVoiceModeRef.current) {
        if (finalText) setChatInput(finalText);
        return;
      }

      setChatInput("");
      if (!finalText) {
        setVoiceErrorHint(TRANSLATIONS[lang].voice_agent_empty);
        if (continuousDialogRef.current) {
          window.setTimeout(() => startListeningRef.current(), 400);
        }
        return;
      }

      setVoiceErrorHint("");
      setAgentPhase("thinking");
      try {
        pendingVoiceReplyRef.current = true;
        await onSubmit(finalText);
      } catch {
        pendingVoiceReplyRef.current = false;
        setAgentPhase("idle");
        setVoiceErrorHint(TRANSLATIONS[lang].voice_agent_error);
        await speakText(TRANSLATIONS[lang].voice_agent_error);
        if (continuousDialogRef.current && agentVoiceModeRef.current) {
          window.setTimeout(() => startListeningRef.current(), 400);
        }
      }
    },
    [lang, onSubmit, setChatInput, speakText]
  );

  useEffect(() => {
    if (!agentVoiceMode || !pendingVoiceReplyRef.current) return;
    const lastMsg = chatMessages?.[chatMessages.length - 1];
    if (!lastMsg || lastMsg.sender !== "ai") return;
    if (lastSpokenMessageIdRef.current === lastMsg.id) return;

    pendingVoiceReplyRef.current = false;
    lastSpokenMessageIdRef.current = lastMsg.id;
    const replyText = getMessageText(lastMsg);

    void (async () => {
      await speakText(replyText);
      setAgentPhase("idle");
      if (continuousDialogRef.current && agentVoiceModeRef.current) {
        window.setTimeout(() => startListeningRef.current(), 350);
      }
    })();
  }, [agentVoiceMode, chatMessages, getMessageText, speakText]);

  const startListening = useCallback(() => {
    if (!voiceSupported || !voiceRecognitionCtor) return;
    if (isListening) return;
    if (agentVoiceModeRef.current && agentPhase === "thinking") return;

    cancelTts();
    setVoiceErrorHint("");

    const recognition = new voiceRecognitionCtor();
    recognitionRef.current = recognition;
    voiceFinalTranscriptRef.current = "";

    recognition.lang = lang === "TR" ? "tr-TR" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const transcript = res?.[0]?.transcript ?? "";
        if (res.isFinal) voiceFinalTranscriptRef.current += transcript;
        else interim += transcript;
      }
      const combined = `${voiceFinalTranscriptRef.current}${interim}`.trim();
      if (combined && !agentVoiceModeRef.current) setChatInput(combined);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event?.error === "not-allowed") {
        setVoiceErrorHint(TRANSLATIONS[lang].voice_mic_permission);
      } else if (agentVoiceModeRef.current && event?.error !== "aborted") {
        setVoiceErrorHint(TRANSLATIONS[lang].voice_agent_empty);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      const finalText = voiceFinalTranscriptRef.current.trim();
      if (agentVoiceModeRef.current) {
        setAgentPhase("idle");
        void handleVoiceEnd(finalText);
      } else if (finalText) {
        setChatInput(finalText);
      }
    };

    setIsListening(true);
    if (agentVoiceModeRef.current) setAgentPhase("listening");

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setAgentPhase("idle");
    }
  }, [
    agentPhase,
    cancelTts,
    handleVoiceEnd,
    isListening,
    lang,
    setChatInput,
    voiceRecognitionCtor,
    voiceSupported,
  ]);

  startListeningRef.current = startListening;

  const handleMicClick = useCallback(() => {
    if (!voiceSupported) return;
    if (isListening) {
      stopRecognition();
      setAgentPhase("idle");
      return;
    }
    startListening();
  }, [isListening, startListening, stopRecognition, voiceSupported]);

  const toggleAgentVoiceMode = useCallback(() => {
    setAgentVoiceMode((on) => {
      const next = !on;
      agentVoiceModeRef.current = next;
      if (!next) {
        stopRecognition();
        cancelTts();
        setAgentPhase("idle");
        setVoiceErrorHint("");
      } else {
        setContinuousDialog(true);
        continuousDialogRef.current = true;
        window.setTimeout(() => startListeningRef.current(), 280);
      }
      return next;
    });
  }, [cancelTts, stopRecognition]);

  useEffect(() => {
    if (agentVoiceMode) return;
    if (!ttsEnabled || !ttsSupported) return;
    const lastMsg = chatMessages?.[chatMessages.length - 1];
    if (!lastMsg || lastMsg.sender !== "ai") return;
    if (lastSpokenMessageIdRef.current === lastMsg.id) return;

    const text = getMessageText(lastMsg);
    if (!text) return;

    lastSpokenMessageIdRef.current = lastMsg.id;
    void speakText(text);
  }, [agentVoiceMode, ttsEnabled, ttsSupported, chatMessages, getMessageText, speakText]);

  useEffect(() => {
    if (agentVoiceMode) return;
    if (ttsEnabled) return;
    if (!ttsSupported) return;
    window.speechSynthesis?.cancel();
  }, [agentVoiceMode, ttsEnabled, ttsSupported]);

  useEffect(() => {
    return () => {
      stopRecognition();
      if (ttsSupported) window.speechSynthesis?.cancel();
    };
  }, [stopRecognition, ttsSupported]);

  const statusHint = (() => {
    if (!voiceSupported) return TRANSLATIONS[lang].voice_not_supported;
    if (voiceErrorHint) return voiceErrorHint;
    if (agentVoiceMode) {
      if (isListening || agentPhase === "listening") return TRANSLATIONS[lang].voice_agent_listening;
      if (agentPhase === "thinking") return TRANSLATIONS[lang].voice_agent_thinking;
      if (agentPhase === "speaking") return TRANSLATIONS[lang].voice_agent_speaking;
    }
    if (isListening) return TRANSLATIONS[lang].voice_listening;
    return "";
  })();

  return {
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
    voiceSupported,
    ttsSupported,
  };
}
