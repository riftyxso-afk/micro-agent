import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, X, ExternalLink, ChevronRight } from "lucide-react";

const STORAGE_KEY = "ma_cli_banner_dismissed";

export function CLIBanner() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  return (
    <div
      className="mb-6 flex items-center gap-3 overflow-hidden rounded-2xl border border-[#14B8A6]/20 bg-gradient-to-r from-[#F0FDFA] to-[#CCFBF1] px-4 py-3 shadow-[0_1px_3px_rgba(17,24,39,0.04)]"
      data-testid="cli-banner"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#0A0A0A]">
        <Terminal size={16} strokeWidth={1.75} className="text-[#2DD4BF]" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#0F766E]">
          MicroAgent CLI
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-[#5EEAD4]/80" style={{ color: '#0D9488' }}>
          AI coding assistant langsung di terminal kamu. <span className="hidden sm:inline">Coding, debug, manage files — semua via natural language.</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => { dismiss(); navigate("/cli"); }}
          className="inline-flex items-center gap-1 rounded-lg bg-[#0F766E] px-3 py-1.5 text-[11px] font-semibold text-white transition-all hover:bg-[#115E59] active:scale-[0.97]"
          data-testid="cli-banner-cta"
        >
          Install
          <ExternalLink size={11} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="grid h-7 w-7 place-items-center rounded-lg text-[#6B7280] transition-colors hover:bg-white/60 hover:text-[#111111]"
          aria-label="Dismiss"
          data-testid="cli-banner-dismiss"
        >
          <X size={14} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
