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
export const API_BASE_URL = process.env.REACT_APP_API_URL || "";

const WEB_SEARCH_KEYWORDS = [
  'terbaru', 'sekarang', 'hari ini', 'kemarin', 'tahun ini', 'tahun depan',
  'latest', 'current', 'today', 'this year', 'recent', 'breaking',
  'berita', 'news', 'harga', 'price', 'cuaca', 'weather',
  'stock', 'saham', 'crypto', 'bitcoin',
  'siapa', 'siapakah', 'kapan', 'dimana',
  'who is', 'who won', 'what happened', 'election', 'pemilu', 'hasil', 'score',
  'schedule', 'jadwal', 'event', 'release date', 'rilis',
  '2025', '2026', '2027',
];

export function needsWebSearch(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  if (/https?:\/\/[^\s]+/.test(text)) return true;
  return WEB_SEARCH_KEYWORDS.some((kw) => lower.includes(kw));
}

const DEBUG_STREAM = true;

const streamLog = (...args) => {
  if (DEBUG_STREAM) console.log("[chat-stream]", ...args);
};

const streamError = (...args) => {
  if (DEBUG_STREAM) console.error("[chat-stream]", ...args);
};

/**
 * Generate and download a document from AI response content.
 * Calls POST /api/generate-document and triggers browser download.
 *
 * @param {Object} opts
 * @param {string} opts.content  - Markdown text (AI response)
 * @param {string} opts.format   - 'pdf' | 'docx' | 'txt' | 'md'
 * @param {string} opts.title    - Document title
 * @param {string} [opts.modelId]
 */
/**
 * Detect if a user message is an image generation request.
 */
const IMAGE_KEYWORDS = [
  "buatkan gambar", "buat gambar", "generate gambar", "generate image",
  "create image", "buat foto", "buatkan foto", "gambarkan", "ilustrasi",
  "lukiskan", "render gambar", "image of", "picture of", "draw ",
];

export function isImageRequest(text) {
  const lower = (text || "").toLowerCase();
  return IMAGE_KEYWORDS.some((kw) => lower.includes(kw));
}

const COMPARISON_KEYWORDS = [
  "bandingkan", "compare", "vs", "versus", "perbandingan", "comparison",
  "lebih bagus", "lebih baik", "lebih unggul", "mana yang lebih",
  "beda", "difference", "similarities", "persamaan", "perbedaan",
];

export function isComparisonRequest(text) {
  const lower = (text || "").toLowerCase();
  const hasKeyword = COMPARISON_KEYWORDS.some((kw) => lower.includes(kw));
  const hasVsPattern = /\b\w+\s+(?:vs|versus)\s+\w+/.test(lower);
  const hasBandingkanPattern = /(?:bandingkan|compare)\s+.+\s+(?:dengan|with|and|dan)\s+/.test(lower);
  
  return hasKeyword && (hasVsPattern || hasBandingkanPattern || lower.includes("bandingkan") || lower.includes("compare"));
}

/**
 * Call /api/generate-image and return { image_url, prompt }.
 */
export async function generateImage(prompt, userId = null, authToken = null) {
  const headers = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const res = await fetch(`${API_BASE_URL}/api/generate-image`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt, user_id: userId }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || `Server error ${res.status}`);
  }
  return data;
}

/**
 * Stream deep research via SSE. Returns an async generator.
 * Events: { type: 'start'|'step'|'source_found'|'source_added'|'complete'|'error', ... }
 */
export async function* streamDeepResearch(query) {
  const res = await fetch(`${API_BASE_URL}/api/deep-research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n");
    buf = parts.pop() || "";
    for (const line of parts) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ")) {
        try {
          yield JSON.parse(trimmed.slice(6));
        } catch { /* ignore malformed */ }
      }
    }
  }
  if (buf.trim().startsWith("data: ")) {
    try { yield JSON.parse(buf.trim().slice(6)); } catch { /* ignore */ }
  }
}

/**
 * Upload files + prompt to /api/upload-and-analyze.
 * Returns { success, response, files_analyzed }
 */
export async function uploadAndAnalyze({ files, prompt, chatHistory = [] }) {
  const formData = new FormData();
  // Accept both raw File objects and pre-built FormData entries
  const fileArray = Array.isArray(files) ? files : [];
  if (!fileArray.length) throw new Error("No files to analyze");
  fileArray.forEach((file) => formData.append("files", file));
  const cleanPrompt = (prompt || "").replace(/^Tolong analisis file:[^\n]*/i, "").trim()
    || "Tolong analisis file yang saya upload. Berikan ringkasan lengkap isi dokumen.";
  formData.append("prompt", cleanPrompt);
  formData.append("chat_history", JSON.stringify(
    chatHistory.slice(-6).map((m) => ({ role: m.role, content: m.text || m.content || "" }))
  ));

  const res = await fetch(`${API_BASE_URL}/api/upload-and-analyze`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || `Server error ${res.status}`);
  }
  return data;
}

export async function generateDocument({ content, format, title, modelId }) {
  const res = await fetch(`${API_BASE_URL}/api/generate-document`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, format, title, model_id: modelId }),
  });

  // Read body once as blob to avoid "body stream already read" error
  const blob = await res.blob();

  if (!res.ok) {
    // Try to parse error message from blob
    const text = await blob.text().catch(() => "");
    let message = `Server error ${res.status}`;
    try { message = JSON.parse(text).error || message; } catch { /* ignore */ }
    throw new Error(message);
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  // Get filename from Content-Disposition header if available
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match ? match[1] : `document.${format}`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function streamChat({
  messages,
  modelId,
  autoMode,
  room,
  attachments,
  webSearch = true,
  reasoning = true,
  searchModePrompt = "",
  skillSlug = null,
  effortLevel = "low",
  comparison = false,
  userId = null,
  authToken = null,
  signal,
  onMeta,
  onStatus,
  onThinking,
  onReasoning,
  onToken,
  onDone,
  onError,
  onComparisonData,
}) {
  streamLog("request:start", {
    url: `${API_BASE_URL}/api/chat/stream`,
    modelId,
    autoMode,
    room,
    messages: messages?.length || 0,
    attachments: attachments?.length || 0,
    webSearch,
    searchModePrompt: searchModePrompt ? searchModePrompt.slice(0, 40) + "..." : "off",
  });

  const headers = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      messages,
      model_id: modelId,
      auto_mode: autoMode,
      room,
      attachments: attachments || [],
      web_search: webSearch,
      reasoning,
      search_mode_prompt: searchModePrompt || "",
      skill_slug: skillSlug || null,
      effort_level: effortLevel,
      comparison: comparison,
      user_id: userId || null,
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
        onError?.(new Error(`Server error ${response.status}: ${text.slice(0, 200)}`));
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        streamError("reader:missing");
        onError?.(new Error("Streaming not available"));
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
            case "reasoning":
              onReasoning?.(parsed.text);
              break;
            case "token":
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
            case "comparison_data":
              streamLog("event:comparison_data", parsed);
              onComparisonData?.(parsed);
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

        const chunk = decoder.decode(value, { stream: true });
        streamLog("stream:chunk", chunk.length, "chars:", chunk.slice(0, 200));
        buf += chunk;
        const parts = buf.split("\n");
        buf = parts.pop() || "";

        for (const line of parts) {
          const trimmed = line.trim();
          if (!trimmed) {
            dispatch(null);
            continue;
          }
          if (trimmed.startsWith("event: ")) {
            currentEvent = trimmed.slice(7).trim();
          } else if (trimmed.startsWith("data: ")) {
            dispatch(trimmed.slice(6).trim());
          }
        }
      }
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
        return;
      }
      if (err.message?.includes("Failed to fetch") || err.message?.includes("net::ERR_")) {
        const helpText = API_BASE_URL
          ? `Cannot connect to backend (${API_BASE_URL}). Make sure the server is running.`
          : "Backend not configured. Set REACT_APP_API_URL in environment.";
        onError?.(new Error(helpText));
        return;
      }
      onError?.(err);
    });
}


// ── RAG Document APIs ────────────────────────────────────────────────────────

export async function ragUploadDocument(file, userId, authToken = null, isPublic = false) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);
  formData.append("is_public", isPublic);

  const headers = {};
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE_URL}/api/rag/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  return res.json();
}

export async function ragListDocuments(userId, authToken = null) {
  const headers = {};
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE_URL}/api/rag/documents?user_id=${encodeURIComponent(userId)}`, {
    headers,
  });
  return res.json();
}

export async function ragDeleteDocument(documentId, userId, authToken = null) {
  const headers = {};
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE_URL}/api/rag/documents/${documentId}?user_id=${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers,
  });
  return res.json();
}

export async function aiGenerateDocument(prompt, userId, authToken = null, modelId = "deepseek-v4-flash") {
  const headers = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE_URL}/api/ai-generate-doc`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt, user_id: userId, model_id: modelId }),
  });
  return res.json();
}
