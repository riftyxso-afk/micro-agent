import { useState } from "react";
import { MarkdownMessage } from "@/components/chat/MarkdownMessage";
import { API_BASE_URL } from "@/lib/chatApi";

export function ComparisonPanel({ comparisonId, responseA, responseB, session, onChoose }) {
  const [chosen, setChosen] = useState(null);
  const [loading, setLoading] = useState(false);

  const choose = async (choice) => {
    setChosen(choice);
    setLoading(true);
    if (comparisonId) {
      await fetch(`${API_BASE_URL}/api/chat/comparison/${comparisonId}/choose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
        },
        body: JSON.stringify({ chosen: choice }),
      }).catch(() => {});
    }
    setLoading(false);
    onChoose(choice === "a" ? responseA : choice === "b" ? responseB : responseA);
  };

  if (chosen) return null; // collapse after choice

  return (
    <div className="my-4 space-y-3">
      <p className="text-center text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">
        Pilih respons yang lebih baik
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[{ key: "a", resp: responseA }, { key: "b", resp: responseB }].map(({ key, resp }) => (
          <div key={key} className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
            <div className="px-4 py-2 border-b border-[#F0F1F3] bg-[#F9FAFB]">
              <span className="text-xs font-semibold text-[#6B7280]">Response {key.toUpperCase()}</span>
            </div>
            <div className="flex-1 p-4 text-sm leading-relaxed overflow-y-auto max-h-64">
              <MarkdownMessage text={resp} />
            </div>
            <div className="px-4 py-3 border-t border-[#F0F1F3]">
              <button
                onClick={() => choose(key)}
                disabled={loading}
                className="w-full rounded-xl bg-[#6366F1] py-2 text-xs font-medium text-white hover:bg-[#4F46E5] disabled:opacity-50 transition-colors"
              >
                Pilih ini
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3">
        <button onClick={() => choose("both_good")} disabled={loading}
          className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
          Keduanya bagus
        </button>
        <span className="text-[#E5E7EB]">·</span>
        <button onClick={() => choose("both_bad")} disabled={loading}
          className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
          Keduanya kurang
        </button>
        <span className="text-[#E5E7EB]">·</span>
        <button onClick={() => onChoose(responseA)} disabled={loading}
          className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
          Lewati
        </button>
      </div>
    </div>
  );
}
