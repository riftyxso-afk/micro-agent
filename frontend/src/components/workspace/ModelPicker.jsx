import { useMemo, useState } from "react";
import { Search, Check, Zap, Wand2, TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  MODELS,
  MODEL_CATEGORIES,
  AUTO_MODEL,
  DEFAULT_MODEL_ID,
  getModelById,
} from "@/lib/workspaceData";

const ModelDot = ({ color, size = 10 }) => (
  <span
    aria-hidden="true"
    className="inline-block shrink-0 rounded-full"
    style={{
      width: size,
      height: size,
      background: color,
      boxShadow: `0 0 0 3px ${color}1f`,
    }}
  />
);

const ModelCard = ({ model, selected, onClick }) => (
  <button
    type="button"
    data-testid={`model-card-${model.id}`}
    onClick={onClick}
    aria-pressed={selected}
    className={`ma-focus flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left transition-all duration-150 ease-out active:scale-[0.99] ${
      selected
        ? "border-2 border-[#111111] shadow-[0_2px_8px_rgba(17,24,39,0.08)]"
        : "border border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-[0_2px_8px_rgba(17,24,39,0.05)]"
    }`}
  >
    {model.isAuto ? (
      <span className="ma-logo-mark grid h-8 w-8 shrink-0 place-items-center rounded-xl">
        <Wand2 size={15} strokeWidth={2} className="text-white" />
      </span>
    ) : (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#F0F1F3] bg-[#FAFAFA]">
        <ModelDot color={model.color} size={11} />
      </span>
    )}
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="flex items-center gap-1.5 text-sm font-medium text-[#111111]">
        <span className="truncate">{model.name}</span>
        {model.isExpensive && (
          <span className="shrink-0 rounded-full bg-[#FEF3C7] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-[#B45309]">
            Ultra
          </span>
        )}
      </span>
      <span className="truncate text-xs text-[#6B7280]">{model.tag}</span>
    </span>
    {model.credits !== null && (
      <span
        className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          model.isExpensive
            ? "bg-[#FEF3C7] text-[#B45309]"
            : "bg-[#F7F7F8] text-[#6B7280]"
        }`}
      >
        <Zap size={10} strokeWidth={2.25} />
        {model.credits}
      </span>
    )}
    {selected && (
      <Check size={16} strokeWidth={2.5} className="shrink-0 text-[#111111]" />
    )}
  </button>
);

export const ModelPicker = ({
  open,
  onOpenChange,
  selectedId,
  autoMode,
  onSelect,
}) => {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [ultraWarning, setUltraWarning] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MODELS.filter((m) => {
      const matchesTab = tab === "all" || m.categories.includes(tab);
      const matchesQuery = !q || m.name.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [query, tab]);

  const showAuto =
    tab === "all" &&
    (!query.trim() || AUTO_MODEL.name.toLowerCase().includes(query.trim().toLowerCase()));

  const closeAndReset = (value) => {
    onOpenChange(value);
    if (!value) {
      setUltraWarning(null);
      setQuery("");
      setTab("all");
    }
  };

  const pick = (model, isAuto = false) => {
    if (model.isExpensive) {
      setUltraWarning(model);
      return;
    }
    onSelect(model, isAuto);
    toast(`Model set to ${model.name}`, {
      description: isAuto
        ? "MicroAgent picks the best model for every prompt"
        : `${model.tag} · ⚡${model.credits} per message`,
    });
    closeAndReset(false);
  };

  const confirmUltra = () => {
    onSelect(ultraWarning, false);
    toast(`Model set to ${ultraWarning.name}`, {
      description: `Ultra model · ⚡${ultraWarning.credits} per message`,
    });
    closeAndReset(false);
  };

  const switchCheaper = () => {
    const cheaper = getModelById(DEFAULT_MODEL_ID);
    onSelect(cheaper, false);
    toast(`Switched to ${cheaper.name}`, {
      description: `${cheaper.tag} · ⚡${cheaper.credits} per message`,
    });
    closeAndReset(false);
  };

  return (
    <Dialog open={open} onOpenChange={closeAndReset}>
      <DialogContent
        data-testid="model-picker"
        className="left-0 top-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-[#E5E7EB] bg-[#FCFCFD] p-0 sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[82vh] sm:w-full sm:max-w-[600px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]"
      >
        <div className="border-b border-[#F0F1F3] px-5 pb-4 pt-5">
          <DialogTitle className="text-base font-semibold text-[#111111]">
            Choose a model
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-xs text-[#6B7280]">
            Switch models anytime — each message shows its model and cost
          </DialogDescription>

          {!ultraWarning && (
            <>
              <div className="relative mt-4">
                <Search
                  size={15}
                  strokeWidth={1.75}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                />
                <input
                  data-testid="model-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search models"
                  className="ma-focus h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-3 text-sm text-[#111111] placeholder:text-[#9CA3AF]"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {MODEL_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    data-testid={`model-tab-${c.id}`}
                    onClick={() => setTab(c.id)}
                    aria-pressed={tab === c.id}
                    className={`ma-focus rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-out ${
                      tab === c.id
                        ? "bg-[#111111] text-white"
                        : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:text-[#111111] hover:bg-[#FAFAFA]"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {ultraWarning ? (
          <div className="ma-fade-in flex flex-1 flex-col justify-center gap-4 px-5 py-6" data-testid="ultra-warning">
            <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FEF3C7]">
                  <TriangleAlert size={17} strokeWidth={1.75} className="text-[#B45309]" />
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-[#111111]">
                    {ultraWarning.name}
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[11px] font-semibold text-[#B45309]">
                      <Zap size={10} strokeWidth={2.25} />
                      {ultraWarning.credits}
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#92710C]">
                    This model uses ⚡{ultraWarning.credits} credits per message.
                    Use it for complex reasoning or important tasks.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                data-testid="use-ultra-button"
                onClick={confirmUltra}
                className="ma-focus h-10 flex-1 rounded-xl bg-[#111111] px-4 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-[#2D2D2D] active:scale-[0.99]"
              >
                Use Ultra Model
              </button>
              <button
                type="button"
                data-testid="switch-cheaper-button"
                onClick={switchCheaper}
                className="ma-focus h-10 flex-1 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] transition-colors duration-150 ease-out hover:bg-[#F7F7F8] active:scale-[0.99]"
              >
                Switch to Cheaper Model
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
            {showAuto && (
              <ModelCard
                model={AUTO_MODEL}
                selected={autoMode}
                onClick={() => pick(AUTO_MODEL, true)}
              />
            )}
            {filtered.map((m) => (
              <ModelCard
                key={m.id}
                model={m}
                selected={!autoMode && selectedId === m.id}
                onClick={() => pick(m)}
              />
            ))}
            {!showAuto && filtered.length === 0 && (
              <p className="py-10 text-center text-sm text-[#9CA3AF]">
                No models match “{query}”
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
