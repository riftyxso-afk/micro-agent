import { CheckCircle2 } from "lucide-react";

const STATUS_COLORS = {
  pending: { border: "border-[#E5E7EB]", bg: "bg-white", opacity: "opacity-40" },
  in_progress: { border: "border-amber-300", bg: "bg-amber-50/40", opacity: "" },
  streaming: { border: "border-blue-300", bg: "bg-blue-50/40", opacity: "" },
  complete: { border: "border-emerald-300", bg: "bg-emerald-50/40", opacity: "" },
};

export const StageCard = ({ icon, title, status, text }) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const isActive = status === "in_progress" || status === "streaming";
  const isDone = status === "complete";

  return (
    <div className={`ma-stage-enter rounded-xl border ${colors.border} ${colors.bg} ${colors.opacity} px-4 py-3 transition-all duration-200`}>
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className={`text-[13px] font-semibold ${isDone ? "text-emerald-700" : isActive ? "text-[#111111]" : "text-[#9CA3AF]"}`}>
          {title}
        </span>
        {isDone && (
          <CheckCircle2 size={13} strokeWidth={2.5} className="text-emerald-500" />
        )}
        {isActive && (
          <span className={`ml-auto grid h-3 w-3 place-items-center ${status === "streaming" ? "text-blue-500" : "text-amber-500"}`}>
            <span className={`absolute h-3 w-3 rounded-full border-2 ${status === "streaming" ? "border-blue-500" : "border-amber-500"} animate-ping opacity-30`} />
            <span className={`relative h-1.5 w-1.5 rounded-full ${status === "streaming" ? "bg-blue-500" : "bg-amber-500"}`} />
          </span>
        )}
      </div>
      {text && (
        <p className="mt-1.5 text-[12px] leading-relaxed text-[#6B7280]">
          {text}
          {isActive && <span className="ma-caret-ai ml-0.5 align-middle" aria-hidden="true" />}
        </p>
      )}
    </div>
  );
};
