import { useState } from "react";
import {
  Globe, BarChart3, Bug, Terminal, Send, Sparkles,
} from "lucide-react";

const ICON_MAP = {
  Globe, BarChart3, Bug, Terminal,
};

export const ClarificationOptions = ({ message, onRefine }) => {
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [customMode, setCustomMode] = useState(false);

  const handleSelect = (opt) => {
    setSelected(opt.id);
    if (opt.id === "other") {
      setCustomMode(true);
    } else {
      setCustomMode(false);
      setInput("");
    }
  };

  const handleSend = () => {
    if (!selected) return;
    const refined = customMode
      ? input.trim()
      : `${selected === "debugging" ? "Tolong bantu debug kode berikut:\n" : `Saya butuh bantuan ${selected === "web-dev" ? "web development" : selected === "data-science" ? "data science / AI" : ""}: `}${input.trim()}`;
    if (!refined) return;
    onRefine(refined);
  };

  const options = message?.clarifyOptions || [];

  return (
    <div className="mt-3 space-y-2" data-testid="clarification-options">
      <p className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
        <Sparkles size={12} strokeWidth={1.75} />
        Pilih yang sesuai atau tulis manual
      </p>

      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const Icon = ICON_MAP[opt.icon] || Terminal;
          const active = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              data-testid={`clarify-option-${opt.id}`}
              onClick={() => handleSelect(opt)}
              className={`ma-focus rounded-2xl border p-3 text-left transition-all duration-150 ease-out ${
                active
                  ? "border-[#6366F1] bg-[#EEF2FF] shadow-[0_0_0_1px_#6366F1]"
                  : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-sm"
              }`}
            >
              <span className={`mb-1.5 grid h-7 w-7 place-items-center rounded-lg ${
                active ? "bg-[#6366F1] text-white" : "bg-[#F7F7F8] text-[#6B7280]"
              }`}>
                <Icon size={14} strokeWidth={1.75} />
              </span>
              <p className="text-[13px] font-medium text-[#111111]">{opt.title}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-[#6B7280]">{opt.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={
            selected
              ? customMode
                ? "Tulis kebutuhan kamu..."
                : "Detail tambahan (opsional)..."
              : "Pilih opsi di atas dulu..."
          }
          disabled={!selected}
          className="ma-focus h-10 flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-sm text-[#111111] placeholder:text-[#9CA3AF] transition-colors focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] disabled:cursor-not-allowed disabled:opacity-40"
        />
        <button
          type="button"
          data-testid="clarify-send-button"
          onClick={handleSend}
          disabled={!selected || (!input.trim() && !customMode)}
          className="ma-focus grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#6366F1] text-white transition-colors hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={15} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
};
