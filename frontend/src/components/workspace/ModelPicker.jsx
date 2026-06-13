import { useMemo, useState } from "react";
import { Search, Check, Zap, TriangleAlert } from "lucide-react";
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
import { ModelIcon } from "@/components/workspace/ModelIcon";

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
    className={`ma-focus flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left transition-[border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.99] ${
      selected
        ? "border-2 border-[#111111] shadow-[0_2px_8px_rgba(17,24,39,0.08)]"
        : "border border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-[0_2px_8px_rgba(17,24,39,0.05)]"
    }`}
  >
    {model.isAuto ? (
      <ModelIcon model={model} size={32} />
    ) : (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#F0F1F3] bg-[#FAFAFA]">
        <ModelIcon model={model} size={22} />
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
          <div className="ma-fade-in flex flex-1 flex-col justify-center gap-4 bg-[radial-gradient(circle_at_20%_0%,rgba(255,214,165,0.18),transparent_38%),radial-gradient(circle_at_100%_20%,rgba(165,180,252,0.16),transparent_34%),#050505] px-5 py-6" data-testid="ultra-warning">
            <div className="overflow-hidden rounded-[28px] border border-white/14 bg-white/[0.08] p-5 text-white shadow-[0_20px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{ultraWarning.name}</p>
                  <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
                    <span className="text-2xl font-semibold tracking-[-0.04em] text-white">
                      Unlock Ultra reasoning
                    </span>
                    <span className="text-sm font-medium text-white/58 line-through">
                      ⚡900
                    </span>
                    <span className="text-xl font-semibold tracking-[-0.03em] text-white">
                      ⚡{ultraWarning.credits}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-white/62">
                    Premium model for complex tasks and difficult reasoning.
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#4A1D0E]/80 px-3 py-1 text-xs font-semibold text-[#FDBA74]">
                  <TriangleAlert size={13} strokeWidth={1.75} />
                  Save 66%
                </span>
              </div>

              <button
                type="button"
                data-testid="use-ultra-button"
                onClick={confirmUltra}
                className="ma-focus h-11 w-full rounded-full bg-white text-sm font-semibold text-black shadow-[0_8px_24px_rgba(255,255,255,0.16)] transition-[background-color,transform] duration-150 ease-out hover:bg-white/90 active:scale-[0.99]"
              >
                Use {ultraWarning.name}
              </button>

              <div className="mt-5 space-y-3.5">
                {[
                  "Solve extremely difficult tasks",
                  "Highest usage limits",
                  "Longer expert conversations",
                  "Priority answers and early access",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm font-semibold text-white">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white/82">
                      <Zap size={14} strokeWidth={1.75} />
                    </span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              data-testid="switch-cheaper-button"
              onClick={switchCheaper}
              className="ma-focus h-10 rounded-full border border-white/12 bg-white/[0.06] px-4 text-sm font-medium text-white/78 backdrop-blur-xl transition-[background-color,transform] duration-150 ease-out hover:bg-white/[0.1] active:scale-[0.99]"
            >
              Switch to Cheaper Model
            </button>
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
