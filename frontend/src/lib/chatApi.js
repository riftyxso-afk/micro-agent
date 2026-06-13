/**
 * SSE-over-POST client for /api/chat/stream
 *
 * Events from backend:
 *   event: meta     { provider, model, autoMode }
 *   event: thinking  { step }
 *   event: token     { text }
 *   event: done      { status }
 *   event: error     { message }
 */
const API_BASE_URL = "http://127.0.0.1:8001"; // Direct connection to backend
const DEBUG_STREAM = true;

const streamLog = (...args) => {
  if (DEBUG_STREAM) console.log("[chat-stream]", ...args);
};

const streamError = (...args) => {
  if (DEBUG_STREAM) console.error("[chat-stream]", ...args);
};

export function streamChat({
  messages,
  modelId,
  autoMode,
  room,
  attachments,
  webSearch = false,
  signal,
  onMeta,
  onStatus,
  onThinking,
  onToken,
  onDone,
  onError,
}) {
  streamLog("request:start", {
    modelId,
    autoMode,
    room,
    messages: messages?.length || 0,
    attachments: attachments?.length || 0,
    webSearch,
  });

  fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      model_id: modelId,
      auto_mode: autoMode,
      room,
      attachments: attachments || [],
      web_search: webSearch,
    }),
    signal,
  })
    .then(async (response) => {
      streamLog("response", {
        ok: response.ok,
        status: response.status,
        contentType: response.headers.get("content-type"),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        streamError("response:not-ok", response.status, text.slice(0, 500));
        onError?.(new Error(`Server ${response.status}: ${text.slice(0, 200)}`));
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        streamError("reader:missing");
        onError?.(new Error("Streaming tidak tersedia"));
        return;
      }

      const decoder = new TextDecoder();
      let buf = "";
      let currentEvent = "";
      let completed = false;

      function finish(payload = { status: "completed" }) {
        if (completed) {
          streamLog("finish:skip-already-completed", payload);
          return;
        }
        streamLog("finish", payload);
        completed = true;
        onDone?.(payload);
      }

      function fail(error) {
        if (completed) {
          streamLog("fail:skip-already-completed", error?.message);
          return;
        }
        streamLog("fail", error?.message);
        completed = true;
        onError?.(error);
      }

      function dispatch(dataLine) {
        if (!currentEvent || !dataLine) {
          if (!currentEvent && dataLine) streamLog("dispatch:no-current-event", dataLine.slice(0, 100));
          return;
        }
        try {
          const parsed = JSON.parse(dataLine);
          switch (currentEvent) {
            case "meta":
              streamLog("event:meta", parsed);
              onMeta?.(parsed);
              break;
            case "status":
              streamLog("event:status", parsed);
              onStatus?.(parsed);
              break;
            case "thinking":
              streamLog("event:thinking", parsed.step);
              onThinking?.(parsed.step);
              break;
            case "token":
              streamLog("event:token", JSON.stringify(parsed.text).slice(0, 80));
              onToken?.(parsed.text);
              break;
            case "done":
              streamLog("event:done", parsed);
              finish(parsed);
              break;
            case "error":
              streamLog("event:error", parsed.message);
              fail(new Error(parsed.message || "Unknown streaming error"));
              break;
            default:
              streamLog("event:unknown", currentEvent, parsed);
          }
        } catch (e) {
          streamLog("dispatch:json-error", dataLine.slice(0, 200), e?.message);
        }
        currentEvent = "";
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n");
        buf = parts.pop() || "";

        for (const line of parts) {
          const trimmed = line.trim();
          if (!trimmed) {
            dispatch(null); /* empty line = event delimiter, dispatch last event */
            continue;
          }
          if (trimmed.startsWith("event: ")) {
            currentEvent = trimmed.slice(7).trim();
          } else if (trimmed.startsWith("data: ")) {
            dispatch(trimmed.slice(6).trim());
          }
        }
      }
      /* flush remaining */
      if (buf.trim()) {
        const trimmed = buf.trim();
        if (trimmed.startsWith("data: ")) {
          dispatch(trimmed.slice(6).trim());
        }
      }
      finish();
    })
    .catch((err) => {
      if (err.name === "AbortError") {
        /* stopped by user — not an error to surface */
        return;
      }
      onError?.(err);
    });
}
