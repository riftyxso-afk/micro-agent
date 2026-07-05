import { CheckCircle2 } from "lucide-react";

const BADGE_STYLES = {
  thinking: { text: "Thinking", bg: "bg-amber-50", textColor: "text-amber-700", dot: "bg-amber-400" },
  searching: { text: "Searching", bg: "bg-blue-50", textColor: "text-blue-700", dot: "bg-blue-400" },
  answering: { text: "Answering", bg: "bg-emerald-50", textColor: "text-emerald-700", dot: "bg-emerald-400" },
  complete: { text: "Complete", bg: "bg-emerald-100", textColor: "text-emerald-800", dot: null },
  cancelled: { text: "Cancelled", bg: "bg-gray-100", textColor: "text-gray-600", dot: null },
};

export const StatusBadge = ({ stage, aborted, completed }) => {
  let key = stage;
  if (completed) key = "complete";
  if (aborted) key = "cancelled";
  const s = BADGE_STYLES[key] || BADGE_STYLES.thinking;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.bg} ${s.textColor}`}
    >
      {s.dot ? (
        <span className={`h-1.5 w-1.5 rounded-full ${s.dot} animate-pulse`} />
      ) : (
        <CheckCircle2 size={10} strokeWidth={2.5} />
      )}
      {s.text}
    </span>
  );
};
