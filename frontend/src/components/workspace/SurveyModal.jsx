import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/chatApi";

const FEATURES = [
  "Chat AI multi-model",
  "Web Search otomatis",
  "Generate gambar",
  "Memory lintas chat",
  "Upload dokumen (RAG)",
  "Deep Research",
  "Perbandingan produk",
  "Generate dokumen (PDF/Word)",
];

const PAIN_SUGGESTIONS = [
  "Respons lambat",
  "Hasil kurang akurat",
  "UI membingungkan",
  "Sering error",
  "Token habis cepat",
];

export function SurveyModal({ session, onClose }) {
  const [score, setScore] = useState(null);
  const [features, setFeatures] = useState([]);
  const [pain, setPain] = useState("");
  const [requests, setRequests] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleFeature = (f) =>
    setFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const dismiss = async () => {
    fetch(`${API_BASE_URL}/api/survey`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }) },
      body: JSON.stringify({ dismissed: true }),
    }).catch(() => {});
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`${API_BASE_URL}/api/survey`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }) },
      body: JSON.stringify({
        satisfaction_score: score,
        most_used_feature: features.join(", "),
        pain_points: pain,
        feature_requests: requests,
      }),
    }).catch(() => {});
    toast("🎉 Makasih feedbacknya!", {
      description: "+100 token gratis sudah masuk ke akunmu",
      duration: 5000,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:px-4">
      <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-[#E5E7EB] bg-white shadow-xl max-h-[92dvh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#F0F1F3] px-4 sm:px-6 py-3 sm:py-4 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-[#111111]">Bantu Micro Agent jadi lebih baik 🚀</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">2 menit · semua opsional</p>
          </div>
          <button onClick={dismiss} className="text-[#9CA3AF] hover:text-[#374151] mt-0.5"><X size={16} /></button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-5">
          {/* NPS 1-10 */}
          <div>
            <p className="text-sm font-medium text-[#374151] mb-3">
              Seberapa puas kamu dengan Micro Agent?
              <span className="ml-2 text-xs font-normal text-[#9CA3AF]">1 = sangat tidak puas · 10 = sangat puas</span>
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <button key={n} type="button" onClick={() => setScore(n)}
                  className={`h-9 w-9 rounded-lg border text-sm font-medium transition-colors ${
                    score === n
                      ? n >= 8 ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : n >= 5 ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-red-400 bg-red-50 text-red-600"
                      : "border-[#E5E7EB] text-[#374151] hover:border-[#6366F1]"
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Features used */}
          <div>
            <p className="text-sm font-medium text-[#374151] mb-2">Fitur yang paling sering kamu pakai? <span className="text-xs font-normal text-[#9CA3AF]">(bisa pilih banyak)</span></p>
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f) => (
                <button key={f} type="button" onClick={() => toggleFeature(f)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    features.includes(f)
                      ? "border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]"
                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#6366F1]"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Pain points */}
          <div>
            <p className="text-sm font-medium text-[#374151] mb-2">Ada yang bikin frustrasi?</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {PAIN_SUGGESTIONS.map((s) => (
                <button key={s} type="button"
                  onClick={() => setPain((p) => p ? `${p}, ${s}` : s)}
                  className="rounded-full border border-[#E5E7EB] px-3 py-1 text-xs text-[#6B7280] hover:border-[#F87171] hover:text-[#EF4444] transition-colors">
                  {s}
                </button>
              ))}
            </div>
            <textarea value={pain} onChange={(e) => setPain(e.target.value)}
              placeholder="Atau tulis sendiri... (opsional)"
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#6366F1] focus:outline-none resize-none"
              rows={2} />
          </div>

          {/* Feature requests */}
          <div>
            <p className="text-sm font-medium text-[#374151] mb-2">Fitur apa yang kamu harapkan ke depannya?</p>
            <textarea value={requests} onChange={(e) => setRequests(e.target.value)}
              placeholder="Misal: integrasi dengan Notion, voice input, export ke Markdown... (opsional)"
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#6366F1] focus:outline-none resize-none"
              rows={2} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={dismiss}
              className="flex-1 rounded-xl border border-[#E5E7EB] py-2.5 text-sm text-[#6B7280] hover:bg-[#F7F7F8] transition-colors">
              Lewati
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-xl bg-[#6366F1] py-2.5 text-sm font-medium text-white hover:bg-[#4F46E5] disabled:opacity-50 transition-colors">
              {loading ? "Mengirim..." : "Kirim Feedback ✨"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
