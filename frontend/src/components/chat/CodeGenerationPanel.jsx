import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  FileCode,
  Clock,
  Square,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/chatApi";

const PHASE_CONFIG = {
  generating: {
    label: "Generating code",
    color: "#3B82F6",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Loader2,
    spin: true,
  },
  executing: {
    label: "Executing code",
    color: "#F97316",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: Loader2,
    spin: true,
  },
  complete: {
    label: "Document ready",
    color: "#22C55E",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle,
    spin: false,
  },
  error: {
    label: "Generation failed",
    color: "#EF4444",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: XCircle,
    spin: false,
  },
};

export function CodeGenerationPanel({ prompt, userId, modelId, onComplete, onError }) {
  const [phase, setPhase] = useState("generating");
  const [code, setCode] = useState("");
  const [isExpanded, setExpanded] = useState(true);
  const [filename, setFilename] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [genId, setGenId] = useState("");
  const codeRef = useRef(null);
  const readerRef = useRef(null);

  const handleStop = useCallback(async () => {
    if (genId) {
      try {
        await fetch(`${API_BASE_URL}/api/generate-document-cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gen_id: genId }),
        });
      } catch {}
    }
    if (readerRef.current) {
      readerRef.current.cancel?.();
    }
    setPhase("error");
    setErrorMsg("Dibatalkan oleh pengguna");
  }, [genId]);

  // Auto-scroll code panel as new code streams in
  useEffect(() => {
    if (codeRef.current && isExpanded) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [code, isExpanded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel?.();
      }
    };
  }, []);

  const handleSSEEvent = useCallback((data) => {
    switch (data.type) {
      case "phase":
        setPhase(data.phase);
        if (data.gen_id) setGenId(data.gen_id);
        if (data.phase === "executing") setExpanded(false);
        break;
      case "cancelled":
        setPhase("error");
        setErrorMsg(data.message || "Dibatalkan");
        break;
      case "code_chunk":
        setCode((prev) => prev + data.code);
        break;
      case "complete":
        setPhase("complete");
        setFilename(data.filename);
        setDownloadUrl(data.download_url);
        setExpanded(false);
        onComplete?.({ filename: data.filename, downloadUrl: data.download_url });
        break;
      case "error":
        setPhase("error");
        setErrorMsg(data.message);
        setExpanded(true);
        onError?.(data.message);
        break;
      default:
        break;
    }
  }, [onComplete, onError]);

  const startGeneration = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/generate-document-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, user_id: userId, model_id: modelId || "claude-sonnet-4.5-1m" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Server error" }));
        setPhase("error");
        setErrorMsg(err.error || `HTTP ${res.status}`);
        onError?.(err.error);
        return;
      }

      const reader = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              handleSSEEvent(data);
            } catch {}
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim().startsWith("data: ")) {
        try {
          const data = JSON.parse(buffer.trim().slice(6));
          handleSSEEvent(data);
        } catch {}
      }
    } catch (err) {
      setPhase("error");
      setErrorMsg(err.message || "Connection error");
      onError?.(err.message);
    }
  }, [prompt, userId, modelId, handleSSEEvent, onError]);

  useEffect(() => {
    startGeneration();
  }, [startGeneration]);

  const config = PHASE_CONFIG[phase];
  const Icon = config.icon;
  const isActive = phase === "generating" || phase === "executing";

  return (
    <div
      className="code-gen-panel overflow-hidden rounded-2xl border transition-colors duration-300"
      style={{ borderColor: config.color, maxWidth: 600 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: `${config.color}08` }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: `${config.color}15` }}
          >
            <Icon
              size={14}
              strokeWidth={2}
              className={config.spin ? "animate-spin" : ""}
              style={{ color: config.color }}
            />
          </div>
          <div>
            <span className="text-sm font-medium" style={{ color: config.color }}>
              {config.label}
            </span>
            {isActive && (
              <span className="ml-1.5 inline-flex gap-0.5">
                <span className="code-dot animate-blink" style={{ animationDelay: "0s" }} />
                <span className="code-dot animate-blink" style={{ animationDelay: "0.2s" }} />
                <span className="code-dot animate-blink" style={{ animationDelay: "0.4s" }} />
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isActive && (
            <button
              onClick={handleStop}
              className="ma-focus flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              <Square size={10} fill="currentColor" /> Stop
            </button>
          )}
          {code && (
            <button
              onClick={() => setExpanded(!isExpanded)}
              className="ma-focus flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[#6B7280] transition-colors hover:bg-black/5"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={12} /> Hide
                </>
              ) : (
                <>
                  <ChevronDown size={12} /> Show code
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Code block */}
      <AnimatePresence>
        {isExpanded && code && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F9FAFB] px-4 py-1.5">
              <div className="flex items-center gap-1.5">
                <FileCode size={12} className="text-[#6B7280]" />
                <span className="text-[11px] font-medium text-[#6B7280]">python</span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="ma-focus flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[#6B7280] transition-colors hover:bg-black/5"
              >
                <Copy size={10} /> Copy
              </button>
            </div>

            {/* Code */}
            <pre
              ref={codeRef}
              className="code-gen-pre m-0 max-h-[400px] overflow-y-auto p-4"
            >
              <code>{code}</code>
              {phase === "generating" && (
                <span className="code-cursor ml-0.5 inline-block">|</span>
              )}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {phase === "error" && errorMsg && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-3">
          <pre className="m-0 whitespace-pre-wrap text-xs text-red-600">{errorMsg}</pre>
        </div>
      )}

      {/* Download */}
      {phase === "complete" && downloadUrl && (
        <div className="flex items-center justify-between border-t border-emerald-200 bg-emerald-50 px-4 py-3">
          <a
            href={downloadUrl}
            download={filename}
            className="ma-focus inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-600 active:scale-[0.98]"
          >
            <Download size={14} strokeWidth={2} />
            {filename}
          </a>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600/70">
            <Clock size={10} />
            10 min
          </div>
        </div>
      )}
    </div>
  );
}
