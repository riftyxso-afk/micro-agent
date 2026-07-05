import {
  Type,
  Link,
  MessageSquare,
  Edit3,
  RefreshCw,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Preview loading overlay ───────────────────────────────────────────────────
function PreviewLoading({ state }) {
  const messages = {
    booting: "Booting WebContainers...",
    mounting: "Mounting project files...",
    error: "Preview failed to load.",
  };

  return (
    <div className="pw-preview-loading" aria-label="Loading preview" aria-busy="true">
      {state === "error" ? (
        <>
          <div className="text-[32px]" aria-hidden="true">⚠️</div>
          <p className="pw-preview-loading-text text-[#EF4444]">
            Preview failed to load.
          </p>
          <button
            type="button"
            className="pw-preview-pill"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={12} strokeWidth={2} />
            Retry
          </button>
        </>
      ) : (
        <>
          {/* Animated skeleton blocks */}
          <div className="flex flex-col gap-3 w-full max-w-sm px-8">
            <div className="pw-skeleton h-10 w-3/4 mx-auto rounded-lg" />
            <div className="pw-skeleton h-4 w-full rounded" />
            <div className="pw-skeleton h-4 w-5/6 rounded" />
            <div className="pw-skeleton h-32 w-full rounded-xl mt-2" />
            <div className="pw-skeleton h-4 w-2/3 rounded" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="pw-preview-spinner" aria-hidden="true" />
            <p className="pw-preview-loading-text">{messages[state] ?? "Loading..."}</p>
          </div>
        </>
      )}
    </div>
  );
}

// ── Live status indicator ─────────────────────────────────────────────────────
function LiveIndicator({ state }) {
  const isLive = state === "ready";
  const isBooting = state === "booting" || state === "mounting";

  return (
    <div
      className="pw-live-dot"
      aria-label={isLive ? "Preview is live" : "Preview is loading"}
    >
      <span
        className={`pw-live-dot-circle${isBooting ? " booting" : ""}`}
        aria-hidden="true"
      />
      {isLive ? "Live" : isBooting ? "Loading..." : "Error"}
    </div>
  );
}

// ── Floating visual toolbar ───────────────────────────────────────────────────
const FLOAT_TOOLS = [
  { id: "edit",    label: "Edit text",   icon: Edit3 },
  { id: "type",    label: "Typography",  icon: Type },
  { id: "link",    label: "Links",       icon: Link },
  { id: "comment", label: "Comment",     icon: MessageSquare },
];

function FloatingToolbar() {
  return (
    <div className="pw-float-toolbar" role="toolbar" aria-label="Visual editing tools">
      {FLOAT_TOOLS.map(({ id, label, icon: Icon }) => (
        <Tooltip key={id} delayDuration={150}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={label}
              data-testid={`pw-float-${id}`}
              className="pw-float-btn"
            >
              <Icon size={14} strokeWidth={1.75} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

// ── Main preview panel ────────────────────────────────────────────────────────
export function WorkspacePreviewPanel({
  previewState = "booting",
  previewUrl = null,
  device = "desktop",
}) {
  const isReady = previewState === "ready";

  // Placeholder URL for the iframe when no real WebContainers URL is available
  const iframeSrc = previewUrl || "about:blank";

  return (
    <section
      className="pw-preview-panel"
      aria-label="Live preview"
    >
      <div className={`pw-preview-frame-wrap${device === "mobile" ? " mobile" : ""}`}>
        {/* Live status badge */}
        <LiveIndicator state={previewState} />

        {/* Loading overlay — shown over iframe until ready */}
        {!isReady && <PreviewLoading state={previewState} />}

        {/* Iframe — always present, shown when ready */}
        <iframe
          src={iframeSrc}
          className="pw-preview-iframe"
          title="Project live preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          style={{ opacity: isReady ? 1 : 0, transition: "opacity 400ms ease-out" }}
          data-testid="pw-preview-iframe"
          aria-label="Project preview"
        />

        {/* Floating toolbar — only shown when preview is ready */}
        {isReady && <FloatingToolbar />}
      </div>
    </section>
  );
}
