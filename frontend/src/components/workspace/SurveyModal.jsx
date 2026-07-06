import { useState } from "react";
import { X, Star } from "lucide-react";
import { API_BASE_URL } from "@/lib/chatApi";

const FEATURES = ["Chat AI", "Web Search", "Image Gen", "Memory", "RAG Upload", "Deep Research"];

export function SurveyModal({ session, onClose }) {
  const [score, setScore] = useState(null);
  const [feature, setFeature] = useState("");
  const [pain, setPain] = useState("");
  const [requests, setRequests] = useState("");
  const [loading, setLoading] = useState(false);

  const dismiss = async () => {
    await fetch(`${API_BASE_URL}/api/survey`, {
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
      body: JSON.stringify({ satisfaction_score: score, most_used_feature: feature, pain_points: pain, feature_requests: requests }),
    }).catch(() => {});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[#111111]">Bantu kami berkembang 🙏</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">1 menit, optional</p>
          </div>
          <button onClick={dismiss} className="text-[#9CA3AF] hover:text-[#374151]"><X size={16} /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Satisfaction 1-5 */}
          <div>
            <p className="text-sm font-medium text-[#374151] mb-2">Seberapa puas kamu? <span className="text-[#9CA3AF]">(1-5)</span></p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setScore(n)}
                  className={`h-9 w-9 rounded-lg border text-sm font-medium transition-colors ${score === n ? "border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]" : "border-[#E5E7EB] text-[#374151] hover:border-[#6366F1]"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Most used feature */}
          <div>
            <p className="text-sm font-medium text-[#374151] mb-2">Fitur paling sering dipakai?</p>
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f) => (
                <button key={f} type="button" onClick={() => setFeature(f)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${feature === f ? "border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]" : "border-[#E5E7EB] text-[#6B7280] hover:border-[#6366F1]"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Open text */}
          <textarea value={pain} onChange={(e) => setPain(e.target.value)} placeholder="Ada yang bikin frustrasi? (opsional)"
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#6366F1] focus:outline-none resize-none" rows={2} />
          <textarea value={requests} onChange={(e) => setRequests(e.target.value)} placeholder="Fitur yang kamu harapkan? (opsional)"
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#6366F1] focus:outline-none resize-none" rows={2} />

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={dismiss} className="flex-1 rounded-xl border border-[#E5E7EB] py-2.5 text-sm text-[#6B7280] hover:bg-[#F7F7F8]">Lewati</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-[#6366F1] py-2.5 text-sm font-medium text-white hover:bg-[#4F46E5] disabled:opacity-50">
              {loading ? "Mengirim..." : "Kirim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
