import { useState, useRef, useEffect } from "react";
import { Eye, Download, Code, X, ExternalLink } from "lucide-react";
import { MarkdownMessage } from "@/components/chat/MarkdownMessage";

export function ArtifactCard({ filename, downloadUrl, codeContent, language }) {
  const [showPreview, setShowPreview] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const iframeRef = useRef(null);

  const isHTML = filename?.endsWith(".html") || language === "html";
  const isCSS = filename?.endsWith(".css") || language === "css";
  const isJS = filename?.endsWith(".js") || language === "javascript";

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#F3F4F6] px-4 py-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F3F4F6]">
          <Code size={14} strokeWidth={1.75} className="text-[#6B7280]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#111111] truncate">{filename || "Generated file"}</p>
          <p className="text-[11px] text-[#9CA3AF]">{language || "code"}</p>
        </div>
        <div className="flex gap-2">
          {isHTML && (
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#6366F1] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4F46E5] transition-colors"
            >
              <Eye size={12} /> Preview
            </button>
          )}
          {codeContent && (
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#F7F7F8] transition-colors"
            >
              <Code size={12} /> {showCode ? "Hide" : "Code"}
            </button>
          )}
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={filename}
              className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#F7F7F8] transition-colors"
            >
              <Download size={12} /> Download
            </a>
          )}
        </div>
      </div>

      {/* Code preview */}
      {showCode && codeContent && (
        <div className="border-t border-[#F3F4F6] p-4">
          <MarkdownMessage text={`\`\`\`${language || ""}\n${codeContent}\n\`\`\``} />
        </div>
      )}

      {/* HTML preview modal */}
      {showPreview && isHTML && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPreview(false)}>
          <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
              <span className="text-sm font-medium text-[#111111]">{filename}</span>
              <button onClick={() => setShowPreview(false)} className="text-[#9CA3AF] hover:text-[#374151]">
                <X size={18} />
              </button>
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={codeContent}
              sandbox="allow-scripts allow-forms allow-same-origin"
              className="w-full h-[600px] border-0"
              title={filename}
            />
          </div>
        </div>
      )}
    </div>
  );
}
