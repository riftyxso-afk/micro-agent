import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Trash2,
  X,
  Loader2,
  BookOpen,
  File,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import {
  ragUploadDocument,
  ragListDocuments,
  ragDeleteDocument,
} from "@/lib/chatApi";

const FILE_ICONS = {
  pdf: { icon: FileText, color: "text-[#EF4444]", bg: "bg-[#FEF2F2]" },
  docx: { icon: FileText, color: "text-[#3B82F6]", bg: "bg-[#EFF6FF]" },
  xlsx: { icon: FileSpreadsheet, color: "text-[#22C55E]", bg: "bg-[#F0FDF4]" },
  xls: { icon: FileSpreadsheet, color: "text-[#22C55E]", bg: "bg-[#F0FDF4]" },
  txt: { icon: File, color: "text-[#6B7280]", bg: "bg-[#F7F7F8]" },
  md: { icon: FileText, color: "text-[#8B5CF6]", bg: "bg-[#F5F3FF]" },
};

export const RagPanel = ({ open, onClose }) => {
  const { user, session } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open && user) loadDocs();
  }, [open, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDocs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = session?.access_token;
      const data = await ragListDocuments(user.id, token);
      setDocs(data.documents || []);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;

    for (const file of files) {
      setUploading(true);
      try {
        const token = session?.access_token;
        const result = await ragUploadDocument(file, user.id, token);
        if (result.success) {
          toast(`${result.filename} diproses`, {
            description: `${result.chunks} chunks tersimpan`,
          });
        } else {
          toast.error(`Gagal: ${result.error}`);
        }
      } catch (err) {
        toast.error(`Gagal upload: ${err.message}`);
      } finally {
        setUploading(false);
      }
    }
    loadDocs();
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (docId, filename) => {
    if (!user) return;
    try {
      const token = session?.access_token;
      await ragDeleteDocument(docId, user.id, token);
      toast(`Dihapus: ${filename}`);
      loadDocs();
    } catch (err) {
      toast.error(`Gagal hapus: ${err.message}`);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed right-0 top-0 z-50 flex h-full w-[340px] flex-col border-l border-[#E5E7EB] bg-white shadow-[-4px_0_24px_rgba(17,24,39,0.08)] sm:w-[380px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} strokeWidth={1.75} className="text-[#6366F1]" />
            <span className="text-sm font-semibold text-[#111111]">Knowledge Base</span>
          </div>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6]"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Upload zone */}
        <div className="border-b border-[#E5E7EB] p-4">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.xlsx,.xls,.txt,.md,.csv"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#C7D2FE] bg-[#EEF2FF]/50 py-4 text-[13px] font-medium text-[#6366F1] transition-colors hover:bg-[#EEF2FF] hover:border-[#6366F1]"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Upload size={14} strokeWidth={2} />
                Upload PDF, Word, Excel, TXT
              </>
            )}
          </button>
          <p className="mt-2 text-center text-[10px] text-[#9CA3AF]">
            File akan di-chunk dan di-index untuk RAG
          </p>
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={18} className="animate-spin text-[#6B7280]" />
            </div>
          ) : docs.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen size={28} strokeWidth={1.25} className="mx-auto mb-2 text-[#D1D5DB]" />
              <p className="text-[13px] text-[#9CA3AF]">Belum ada dokumen</p>
              <p className="mt-1 text-[11px] text-[#D1D5DB]">Upload file untuk memulai RAG</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map((doc) => {
                const ext = doc.file_type?.toLowerCase() || "";
                const fileStyle = FILE_ICONS[ext] || FILE_ICONS.txt;
                const Icon = fileStyle.icon;
                return (
                  <div
                    key={doc.id}
                    className="group flex items-center gap-3 rounded-xl border border-[#F3F4F6] bg-white p-3 transition-colors hover:border-[#E5E7EB] hover:shadow-[0_1px_4px_rgba(17,24,39,0.06)]"
                  >
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${fileStyle.bg}`}
                    >
                      <Icon size={16} strokeWidth={1.75} className={fileStyle.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-[#111111]">
                        {doc.filename}
                      </p>
                      <p className="text-[10px] text-[#9CA3AF]">
                        {doc.chunk_count} chunks · {doc.file_type?.toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id, doc.filename)}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#D1D5DB] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                    >
                      <Trash2 size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5E7EB] px-4 py-3">
          <p className="text-center text-[10px] text-[#9CA3AF]">
            {docs.length} dokumen · Upload untuk menambah knowledge
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
