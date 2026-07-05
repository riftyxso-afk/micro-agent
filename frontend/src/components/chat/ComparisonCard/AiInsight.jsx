import { Sparkles } from "lucide-react";

interface AiInsightProps {
  insight: string;
  productAName: string;
  productBName: string;
}

export const AiInsight = ({ insight, productAName, productBName }: AiInsightProps) => {
  return (
    <div className="rounded-xl border border-[#E0F2FE] bg-gradient-to-br from-[#F0F9FF] to-[#EFF6FF] p-4">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#2563EB] mb-1">
            Rekomendasi AI
          </p>
          <p className="text-sm text-[#374151] leading-relaxed">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
};
