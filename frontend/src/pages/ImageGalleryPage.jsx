import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Download, ExternalLink, Loader2, ImageIcon } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { API_BASE_URL } from "@/lib/chatApi";

export default function ImageGalleryPage() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchImages();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchImages = async () => {
    setLoading(true);
    try {
      const token = session?.access_token;
      const res = await fetch(`${API_BASE_URL}/api/images`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setImages(data.images || []);
    } catch {
      setImages([]);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      const token = session?.access_token;
      await fetch(`${API_BASE_URL}/api/images/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {}
    setDeleting(null);
  };

  const handleDownload = (imageUrl, prompt) => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `microagent-${(prompt || "image").slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}.png`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!user) {
    return (
      <div className="min-h-dvh bg-[#F7F7F8] flex flex-col items-center justify-center gap-4 px-4">
        <ImageIcon size={40} strokeWidth={1.25} className="text-[#D1D5DB]" />
        <p className="text-sm font-medium text-[#6B7280]">Sign in to view your generated images</p>
        <button onClick={() => navigate("/auth")} className="rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2D2D2D] transition-colors">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F7F7F8]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <button onClick={() => navigate(-1)}
            className="ma-focus grid h-9 w-9 place-items-center rounded-xl text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111] transition-colors">
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <h1 className="flex-1 text-lg font-semibold text-[#111111]">Generated Images</h1>
          <span className="text-xs text-[#9CA3AF]">{images.length} images</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-[#6B7280]" />
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#F3F4F6]">
              <ImageIcon size={28} strokeWidth={1.25} className="text-[#D1D5DB]" />
            </div>
            <p className="text-sm font-medium text-[#6B7280]">Belum ada gambar</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">Generate gambar dari chat untuk melihatnya di sini</p>
            <button onClick={() => navigate("/chat")}
              className="mt-4 rounded-xl bg-[#111111] px-5 py-2 text-sm font-medium text-white hover:bg-[#2D2D2D] transition-colors">
              Mulai Chat
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((img, i) => (
              <motion.div key={img.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(17,24,39,0.04)] transition-all hover:shadow-md"
                onClick={() => setSelected(img)}
              >
                <div className="aspect-square overflow-hidden">
                  <img src={img.image_url} alt={img.prompt}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="line-clamp-2 text-[11px] font-medium text-white drop-shadow-sm">{img.prompt}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={(e) => { e.stopPropagation(); handleDownload(img.image_url, img.prompt); }}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-[#374151] shadow-sm backdrop-blur-sm hover:bg-white transition-colors">
                    <Download size={13} strokeWidth={2} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                    disabled={deleting === img.id}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-[#EF4444] shadow-sm backdrop-blur-sm hover:bg-white transition-colors disabled:opacity-50">
                    {deleting === img.id ? <Loader2 size={13} strokeWidth={2} className="animate-spin" /> : <Trash2 size={13} strokeWidth={2} />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <img src={selected.image_url} alt={selected.prompt}
              className="max-h-[70vh] w-full object-contain" />
            <div className="flex items-center gap-3 border-t border-[#E5E7EB] px-5 py-3">
              <p className="min-w-0 flex-1 truncate text-sm text-[#374151]">{selected.prompt}</p>
              <div className="flex shrink-0 gap-2">
                <a href={selected.image_url} target="_blank" rel="noopener noreferrer"
                  className="grid h-8 w-8 place-items-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
                  <ExternalLink size={14} strokeWidth={1.75} />
                </a>
                <button onClick={() => handleDownload(selected.image_url, selected.prompt)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
                  <Download size={14} strokeWidth={1.75} />
                </button>
                <button onClick={() => { handleDelete(selected.id); setSelected(null); }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-[#EF4444] hover:bg-[#FEF2F2] transition-colors">
                  <Trash2 size={14} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
