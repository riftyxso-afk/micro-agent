import {
  ChevronDown,
  Clock,
  Columns2,
  MoreHorizontal,
  Eye,
  Monitor,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Plus,
  Share2,
  Upload,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function IconBtn({ label, icon: Icon, onClick, active = false, testId }) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          data-testid={testId}
          onClick={onClick}
          className={`pw-icon-btn${active ? " active" : ""}`}
        >
          <Icon size={15} strokeWidth={1.75} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}

export function WorkspaceTopBar({
  projectName = "Untitled Project",
  activePage = "Homepage",
  pages = ["Homepage"],
  device = "desktop",
  onDeviceChange,
  onRefresh,
  onOpenExternal,
  onShare,
  onPublish,
}) {
  return (
    <header className="pw-topbar" aria-label="Project workspace toolbar">
      {/* Left — project name + subtitle */}
      <div className="pw-topbar-left">
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Project options"
              data-testid="pw-project-name-btn"
              className="pw-project-name-btn"
            >
              <span className="pw-project-name">{projectName}</span>
              <ChevronDown size={13} strokeWidth={2} className="text-[#9CA3AF] flex-shrink-0" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Project options</TooltipContent>
        </Tooltip>

        <span className="pw-project-subtitle hidden sm:block">
          Previewing last saved version
        </span>
      </div>

      {/* Right — controls */}
      <div className="pw-topbar-right">
        <IconBtn label="History" icon={Clock} testId="pw-history-btn" />
        <IconBtn label="Split view" icon={Columns2} testId="pw-split-btn" />
        <IconBtn label="More options" icon={MoreHorizontal} testId="pw-more-btn" />

        <div className="pw-divider-v" aria-hidden="true" />

        {/* Preview pill */}
        <button
          type="button"
          aria-label="Toggle preview"
          data-testid="pw-preview-pill"
          className="pw-preview-pill active"
        >
          <Eye size={12} strokeWidth={2} />
          Preview
        </button>

        <div className="pw-divider-v" aria-hidden="true" />

        {/* Device toggle */}
        <div
          className="pw-device-group"
          role="group"
          aria-label="Device preview"
        >
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Desktop view"
                aria-pressed={device === "desktop"}
                data-testid="pw-device-desktop"
                onClick={() => onDeviceChange?.("desktop")}
                className={`pw-device-btn${device === "desktop" ? " active" : ""}`}
              >
                <Monitor size={13} strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Desktop</TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Mobile view"
                aria-pressed={device === "mobile"}
                data-testid="pw-device-mobile"
                onClick={() => onDeviceChange?.("mobile")}
                className={`pw-device-btn${device === "mobile" ? " active" : ""}`}
              >
                <Smartphone size={13} strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Mobile</TooltipContent>
          </Tooltip>
        </div>

        <IconBtn
          label="Refresh preview"
          icon={RefreshCw}
          onClick={onRefresh}
          testId="pw-refresh-btn"
        />

        {/* Page dropdown */}
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Switch page"
              data-testid="pw-page-dropdown"
              className="pw-preview-pill"
              style={{ gap: 4 }}
            >
              <span className="text-[11px]">{activePage}</span>
              <ChevronDown size={11} strokeWidth={2} className="text-[#9CA3AF]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Switch page</TooltipContent>
        </Tooltip>

        <IconBtn
          label="Open in new tab"
          icon={ExternalLink}
          onClick={onOpenExternal}
          testId="pw-external-btn"
        />

        <div className="pw-divider-v" aria-hidden="true" />

        {/* Collaborators */}
        <div className="flex items-center gap-1">
          <div
            aria-label="Collaborator R"
            className="flex items-center justify-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white font-semibold select-none border-2 border-white"
            style={{ width: 24, height: 24, fontSize: 10 }}
          >
            R
          </div>
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Invite collaborator"
                data-testid="pw-invite-btn"
                className="pw-icon-btn"
                style={{ width: 24, height: 24, borderRadius: "50%" }}
              >
                <Plus size={12} strokeWidth={2.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Invite</TooltipContent>
          </Tooltip>
        </div>

        <div className="pw-divider-v" aria-hidden="true" />

        {/* Publish + Share */}
        <button
          type="button"
          aria-label="Publish project"
          data-testid="pw-publish-btn"
          onClick={onPublish}
          className="pw-publish-btn"
        >
          <Upload size={12} strokeWidth={2.5} />
          Publish
        </button>

        <button
          type="button"
          aria-label="Share project"
          data-testid="pw-share-btn"
          onClick={onShare}
          className="pw-share-btn"
        >
          <Share2 size={12} strokeWidth={2} />
          Share
        </button>
      </div>
    </header>
  );
}
