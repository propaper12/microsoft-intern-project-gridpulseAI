# Voice Agent (Sesli Agent)

Hands-free conversational mode for **Grid AI Copilot**. Speech recognition and speech synthesis run entirely in the browser via the **Web Speech API**. The backend is unchanged: voice turns call the same `POST /api/copilot` endpoint as typed chat.

## Status

Implemented and wired in:

- `frontend/src/hooks/useAgentVoice.js` — listen → auto-submit → TTS → optional continuous loop  
- `frontend/src/components/ChatTerminal.jsx` — UI (Sesli Agent toggle, continuous checkbox, mic, status hints)  
- `frontend/src/utils/constants.js` — TR / EN strings  
- `frontend/src/index.css` — agent voice bar / pulse styles  

`npm run build` must pass (no native modules; frontend-only).

## Modes

### 1. Sesli Agent (conversational)

1. Open **Grid AI Copilot**.  
2. Click **Sesli Agent** / **Talk to Agent**.  
3. Grant microphone permission when prompted.  
4. Listening starts shortly after enable (or press the mic).  
5. Speak clearly and pause; the final transcript is sent with `onSubmit` → `/api/copilot`.  
6. When the AI message arrives, it is spoken with `speechSynthesis` (`tr-TR` or `en-US` from UI language).  
7. If **Sürekli diyalog / Continuous dialog** is checked, listening restarts after TTS ends.

Phases shown in the hint bar: listening → thinking → speaking.

### 2. Classic voice (agent off)

- **Mic:** fills the chat input (you submit manually).  
- **Speaker (TTS toggle):** reads new AI replies aloud without auto-submit.

## Requirements

| Requirement | Notes |
| :--- | :--- |
| Browser | Chrome or Edge recommended (`SpeechRecognition` / `webkitSpeechRecognition`) |
| Origin | `http://127.0.0.1:5173` or `localhost` (secure context for mic) |
| Backend | FastAPI on `127.0.0.1:8000` + Ollama for meaningful replies |
| Network | Mic permission allowed |

Firefox may lack full speech recognition support; the UI shows a “not supported” hint.

## Operator tips

- Use short operational questions (“Trafo 301 overload protocol?”).  
- Wait for the green listening pulse before speaking.  
- Turn continuous dialog **off** for a single question-and-answer.  
- Turning Sesli Agent **off** stops recognition and cancels TTS.  
- Windows: keep API on **127.0.0.1** (see root README).

## What is not included

- No server-side STT/TTS (no Whisper / cloud voice APIs in this feature).  
- No wake-word detection.  
- Voice does not control Autopilot start/stop by itself (use the Autopilot UI).

## Related API

```http
POST /api/copilot
Content-Type: application/json

{ "message": "<recognized text>", "lang": "TR" }
```

Same payload as typed chat (`frontend/src/hooks/useCopilot.js`).
