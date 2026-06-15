import { useState, useRef, useEffect, useCallback } from "react";
import { Download, FileText, FileType, FileCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateDocument } from "@/lib/chatApi";

const FORMATS = [
  {
    id: "pdf",
    label: "PDF",
    description: "Dokumen siap cetak",
    icon: FileType,
  },
  {
    id: "docx",
    label: "Word (.docx)",
    description: "Microsoft Word",
    icon: FileText,
  },
  {
    id: "txt",
    label: "Plain Text",
    description: "Teks biasa (.txt)",
    icon: FileCode,
  },
  {
    id: "md",
    label: "Markdown",
    description: "Format .md",
    icon: FileCode,
  },
];

const baseBtn =
  "ma-focus inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 ease-out disabled:opacity-50";
const highlightBtn = baseBtn + " bg-[#0369A1] text-white hover:bg-[#0284C7]";
const normalBtn = baseBtn + " text-[#6B7280] hover:bg-[#F7F7F8] hover:text-[#111111]";

export const DocumentDownloadMenu = ({ content, title, modelId, highlight }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleDownload = useCallback(
    async (fmt) => {
      if (loading) return;
      setLoading(fmt.id);
      setOpen(false);
      try {
        await generateDocument({
          content,
          format: fmt.id,
          title: title || "MicroAgent Document",
          modelId,
        });
        toast.success("Dokumen berhasil diunduh", {
          description: (title || "Document") + "." + fmt.id,
        });
      } catch (err) {
        toast.error("Gagal membuat dokumen", {
          description: err.message || "Terjadi kesalahan",
        });
      } finally {
        setLoading(null);
      }
    },
    [content, title, modelId, loading],
  );

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        data-testid="download-document-button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        disabled={!!loading}
        className={highlight ? highlightBtn : normalBtn}
      >
        {loading ? (
          <Loader2 size={13} strokeWidth={1.75} className="animate-spin" />
        ) : (
          <Download size={13} strokeWidth={1.75} />
        )}
        {loading ? "Membuat " + loading.toUpperCase() + "\u2026" : "Unduh Dokumen"}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Pilih format dokumen"
          className="absolute bottom-full left-0 z-50 mb-1.5 max-h-[60vh] w-[min(208px,calc(100vw-24px))] overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(17,24,39,0.10)]"
        >
          <div className="border-b border-[#F3F4F6] px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Pilih Format
            </p>
          </div>
          <div className="py-1">
            {FORMATS.map((fmt) => {
              const Icon = fmt.icon;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  role="menuitem"
                  data-testid={"download-" + fmt.id}
                  onClick={() => handleDownload(fmt)}
                  className="ma-focus flex w-full items-center gap-3 px-3 py-2 text-left transition-colors duration-100 hover:bg-[#F7F7F8]"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#F3F4F6] text-[#6B7280]">
                    <Icon size={14} strokeWidth={1.75} />
                  </span>
                  <span>
                    <span className="block text-[13px] font-medium text-[#111111]">
                      {fmt.label}
                    </span>
                    <span className="block text-[11px] text-[#9CA3AF]">
                      {fmt.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
