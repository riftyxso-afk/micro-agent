import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Code,
  Copy,
  Check,
  RefreshCw,
  Maximize2,
  Minimize2,
  X,
  ChevronDown,
  ArrowLeft,
  Clock,
  FileCode,
  FileText,
  File,
} from "lucide-react";
import { MarkdownMessage } from "@/components/chat/MarkdownMessage";
import { API_BASE_URL } from "@/lib/chatApi";

const FILE_ICON_MAP = {
  html: { icon: FileCode, color: "#6366F1", bg: "#EEF2FF" },
  css: { icon: FileCode, color: "#8B5CF6", bg: "#F5F3FF" },
  js: { icon: FileCode, color: "#F59E0B", bg: "#FFFBEB" },
  jsx: { icon: FileCode, color: "#06B6D4", bg: "#ECFEFF" },
  tsx: { icon: FileCode, color: "#3B82F6", bg: "#EFF6FF" },
  ts: { icon: FileCode, color: "#3B82F6", bg: "#EFF6FF" },
  py: { icon: FileCode, color: "#10B981", bg: "#ECFDF5" },
  pdf: { icon: FileText, color: "#EF4444", bg: "#FEF2F2" },
  docx: { icon: FileText, color: "#2563EB", bg: "#EFF6FF" },
  xlsx: { icon: FileText, color: "#16A34A", bg: "#F0FDF4" },
  default: { icon: File, color: "#6B7280", bg: "#F9FAFB" },
};

function getFileIconInfo(filename) {
  if (!filename) return FILE_ICON_MAP.default;
  const ext = filename.split(".").pop()?.toLowerCase();
  return FILE_ICON_MAP[ext] || FILE_ICON_MAP.default;
}

function SyntaxHighlight({ code }) {
  return (
    <pre className="m-0 overflow-x-auto p-5 font-mono text-[13px] leading-[1.65] text-[#111111]">
      <code>{code}</code>
    </pre>
  );
}

export function CanvasPanel({ artifacts, activeArtifactId, onClose, onRefresh, onMaximize, isMaximized, onSelectArtifact, authToken }) {
  const [viewMode, setViewMode] = useState("preview");
  const [copied, setCopied] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null); // null = latest
  const iframeRef = useRef(null);
  const dropdownRef = useRef(null);

  const activeArtifact = useMemo(
    () => artifacts.find((a) => a.id === activeArtifactId) || artifacts[artifacts.length - 1],
    [artifacts, activeArtifactId]
  );

  // Display content: selected version or latest
  const displayContent = useMemo(() => {
    if (selectedVersion) return selectedVersion.content;
    return activeArtifact?.content || "";
  }, [selectedVersion, activeArtifact]);

  const displayVersion = selectedVersion?.version_number || activeArtifact?.version || 1;

  const fileIcon = getFileIconInfo(activeArtifact?.file_name);
  const IconComp = fileIcon.icon;
  const isHTML = activeArtifact?.file_name?.endsWith(".html");

  // Fetch versions when dropdown opens
  const fetchVersions = useCallback(async () => {
    if (!activeArtifact?.id || versions.length > 0) return;
    setLoadingVersions(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/artifacts/${activeArtifact.id}/versions`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      const data = await res.json();
      setVersions(data.versions || []);
    } catch {
      setVersions([]);
    }
    setLoadingVersions(false);
  }, [activeArtifact?.id, authToken, versions.length]);

  useEffect(() => {
    if (showVersions) fetchVersions();
  }, [showVersions, fetchVersions]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showVersions) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowVersions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showVersions]);

  const handleCopy = useCallback(() => {
    if (!displayContent) return;
    navigator.clipboard.writeText(displayContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [displayContent]);

  if (!activeArtifact) return null;

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "100%", opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex h-full flex-col border-l border-[#E5E7EB] bg-white"
      data-testid="canvas-panel"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#F0F1F3] px-3 py-2">
        {/* Mobile back button */}
        <button
          onClick={onClose}
          className="ma-focus flex h-7 w-7 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F3F4F6] lg:hidden"
          data-testid="canvas-back-btn"
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
        </button>

        {/* View mode toggle */}
        <div className="flex items-center gap-0.5 rounded-lg bg-[#F3F4F6] p-0.5">
          <button
            onClick={() => setViewMode("preview")}
            className={`ma-focus flex h-7 w-7 items-center justify-center rounded-md transition-all ${
              viewMode === "preview" ? "bg-white shadow-sm text-[#111111]" : "text-[#9CA3AF] hover:text-[#6B7280]"
            }`}
            title="Preview"
            data-testid="canvas-preview-btn"
          >
            <Eye size={14} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => setViewMode("code")}
            className={`ma-focus flex h-7 w-7 items-center justify-center rounded-md transition-all ${
              viewMode === "code" ? "bg-white shadow-sm text-[#111111]" : "text-[#9CA3AF] hover:text-[#6B7280]"
            }`}
            title="Code"
            data-testid="canvas-code-btn"
          >
            <Code size={14} strokeWidth={1.75} />
          </button>
        </div>

        {/* File name + version dropdown */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
            style={{ background: fileIcon.bg }}
          >
            <IconComp size={12} strokeWidth={1.75} style={{ color: fileIcon.color }} />
          </div>
          <span className="truncate text-[13px] font-medium text-[#111111]">
            {activeArtifact.file_name}
          </span>

          {/* Version badge + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="ma-focus flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
              data-testid="canvas-version-btn"
            >
              <Clock size={9} strokeWidth={2} />
              v{displayVersion}
              <ChevronDown size={9} strokeWidth={2} className={`transition-transform ${showVersions ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showVersions && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg"
                >
                  <div className="border-b border-[#F0F1F3] px-3 py-2">
                    <p className="text-[11px] font-semibold text-[#6B7280]">Versions</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {/* Latest option */}
                    <button
                      onClick={() => { setSelectedVersion(null); setShowVersions(false); }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors hover:bg-[#F7F7F8] ${
                        !selectedVersion ? "bg-[#EEF2FF] text-[#6366F1] font-medium" : "text-[#374151]"
                      }`}
                    >
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700">LATEST</span>
                      <span className="truncate">v{activeArtifact.version}</span>
                    </button>
                    {loadingVersions && (
                      <div className="px-3 py-3 text-center text-[11px] text-[#9CA3AF]">Loading...</div>
                    )}
                    {versions.filter((v) => v.version_number < activeArtifact.version).map((v) => (
                      <button
                        key={v.id}
                        onClick={() => { setSelectedVersion(v); setShowVersions(false); }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors hover:bg-[#F7F7F8] ${
                          selectedVersion?.id === v.id ? "bg-[#EEF2FF] text-[#6366F1] font-medium" : "text-[#374151]"
                        }`}
                      >
                        <span className="text-[#9CA3AF]">v{v.version_number}</span>
                        <span className="truncate text-[10px] text-[#9CA3AF]">{v.created_by_tool}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="ma-focus flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111111]"
            data-testid="canvas-copy-btn"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>

          {/* Rerun (for code execution artifacts) */}
          {activeArtifact.created_by_tool === "execute_code" && onRefresh && (
            <button
              onClick={() => onRefresh(activeArtifact.id)}
              className="ma-focus flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111111]"
              title="Re-run code"
              data-testid="canvas-rerun-btn"
            >
              <RefreshCw size={12} strokeWidth={1.75} />
              <span className="hidden sm:inline">Rerun</span>
            </button>
          )}

          <button
            onClick={onMaximize}
            className="ma-focus flex h-7 w-7 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111111]"
            title={isMaximized ? "Restore" : "Maximize"}
            data-testid="canvas-maximize-btn"
          >
            {isMaximized ? <Minimize2 size={13} strokeWidth={1.75} /> : <Maximize2 size={13} strokeWidth={1.75} />}
          </button>

          {/* Close — hidden on mobile (back button handles it) */}
          <button
            onClick={onClose}
            className="ma-focus hidden h-7 w-7 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111111] lg:flex"
            title="Close"
            data-testid="canvas-close-btn"
          >
            <X size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Artifact tabs */}
      {artifacts.length > 1 && (
        <div className="flex items-center gap-1 overflow-x-auto border-b border-[#F0F1F3] px-3 py-1.5">
          {artifacts.map((art) => {
            const fi = getFileIconInfo(art.file_name);
            const FI = fi.icon;
            const isActive = art.id === activeArtifact.id;
            return (
              <button
                key={art.id}
                onClick={() => onSelectArtifact?.(art.id)}
                className={`ma-focus flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                  isActive
                    ? "bg-[#EEF2FF] text-[#6366F1] border border-[#C7D2FE]"
                    : "text-[#6B7280] hover:bg-[#F7F7F8] border border-transparent"
                }`}
              >
                <FI size={10} strokeWidth={1.75} />
                <span className="max-w-[120px] truncate">{art.file_name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Version indicator banner */}
      {selectedVersion && (
        <div className="flex items-center justify-between border-b border-yellow-200 bg-yellow-50 px-3 py-1.5">
          <span className="text-[11px] font-medium text-yellow-700">
            Viewing v{selectedVersion.version_number} ({selectedVersion.created_by_tool})
          </span>
          <button
            onClick={() => setSelectedVersion(null)}
            className="text-[11px] font-medium text-yellow-800 underline hover:text-yellow-900"
          >
            Back to latest
          </button>
        </div>
      )}

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-auto bg-white">
        {viewMode === "preview" ? (
          <div className="h-full">
            {isHTML ? (
              <iframe
                ref={iframeRef}
                srcDoc={displayContent}
                sandbox="allow-scripts allow-forms"
                className="h-full w-full border-0"
                title={activeArtifact.file_name}
              />
            ) : activeArtifact.file_name?.endsWith(".md") ? (
              <div className="p-5">
                <MarkdownMessage text={displayContent} />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <div className="space-y-2">
                  <FileCode size={32} className="mx-auto text-[#D1D5DB]" />
                  <p className="text-sm text-[#6B7280]">Preview tidak tersedia untuk tipe file ini</p>
                  <button
                    onClick={() => setViewMode("code")}
                    className="ma-focus text-sm font-medium text-[#6366F1] hover:underline"
                  >
                    Lihat source code →
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <SyntaxHighlight code={displayContent} language={activeArtifact.file_name?.split(".").pop()} />
        )}
      </div>
    </motion.div>
  );
}
