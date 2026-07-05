import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SPEC_ROWS = [
  { key: "chipset", label: "Chipset/Prosesor", tooltip: "Prosesor utama yang menentukan performa" },
  { key: "ram", label: "RAM", tooltip: "Memory untuk multitasking" },
  { key: "storage", label: "Storage", tooltip: "Kapasitas penyimpanan internal" },
  { key: "camera", label: "Kamera", tooltip: "Resolusi dan jumlah lensa" },
  { key: "battery", label: "Baterai", tooltip: "Kapasitas baterai dalam mAh" },
  { key: "display", label: "Layar", tooltip: "Ukuran, refresh rate, dan teknologi panel" },
  { key: "os", label: "Sistem Operasi", tooltip: "OS bawaan dari pabrik" },
];

const getWinner = (valA, valB, key) => {
  const numA = parseFloat(valA.replace(/[^0-9.]/g, ""));
  const numB = parseFloat(valB.replace(/[^0-9.]/g, ""));

  if (isNaN(numA) || isNaN(numB)) return "tie";

  const higherIsBetter = ["ram", "storage", "camera", "battery", "display"].includes(key);
  if (higherIsBetter) {
    return numA > numB ? "a" : numA < numB ? "b" : "tie";
  }
  return numA < numB ? "a" : numA > numB ? "b" : "tie";
};

const formatPrice = (price) =>
  `Rp ${price.toLocaleString("id-ID")}`;

export const SpecsTable = ({ productA, productB }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[#111111]">
          Spesifikasi
        </h4>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="ma-focus inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#111111] transition-colors duration-150"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Tutup" : "Buka"}
        </button>
      </div>

      {/* Product Headers */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 mb-3">
        <div />
        <div className="text-center px-3">
          <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-[#F7F7F8] border border-[#E5E7EB] flex items-center justify-center overflow-hidden">
            {productA.image ? (
              <img
                src={productA.image}
                alt={productA.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <span className="text-2xl">📱</span>
            )}
          </div>
          <p className="text-xs font-semibold text-[#111111] truncate max-w-[100px]">
            {productA.name}
          </p>
          <p className="text-[11px] font-medium text-[#2563EB]">
            {formatPrice(productA.avgPrice)}
          </p>
        </div>
        <div className="text-center px-3">
          <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-[#F7F7F8] border border-[#E5E7EB] flex items-center justify-center overflow-hidden">
            {productB.image ? (
              <img
                src={productB.image}
                alt={productB.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <span className="text-2xl">📱</span>
            )}
          </div>
          <p className="text-xs font-semibold text-[#111111] truncate max-w-[100px]">
            {productB.name}
          </p>
          <p className="text-[11px] font-medium text-[#16A34A]">
            {formatPrice(productB.avgPrice)}
          </p>
        </div>
      </div>

      {/* Specs Rows */}
      {expanded && (
        <div className="space-y-0">
          {SPEC_ROWS.map((spec, idx) => {
            const valA = productA.specs[spec.key];
            const valB = productB.specs[spec.key];
            const winner = getWinner(valA, valB, spec.key);

            return (
              <div
                key={spec.key}
                className={`grid grid-cols-[1fr_auto_auto] gap-2 py-2.5 ${
                  idx < SPEC_ROWS.length - 1 ? "border-b border-[#F0F1F3]" : ""
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[#6B7280]">
                    {spec.label}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                        <Info size={12} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">
                      <p>{spec.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div
                  className={`text-right px-3 py-1 rounded-lg text-xs font-medium ${
                    winner === "a"
                      ? "bg-[#DCFCE7] text-[#16A34A]"
                      : "text-[#374151]"
                  }`}
                >
                  {valA}
                </div>
                <div
                  className={`text-right px-3 py-1 rounded-lg text-xs font-medium ${
                    winner === "b"
                      ? "bg-[#DCFCE7] text-[#16A34A]"
                      : "text-[#374151]"
                  }`}
                >
                  {valB}
                </div>
              </div>
            );
          })}

          {/* Features Row */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 py-2.5 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-[#6B7280]">
                Fitur Unggulan
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  <p>Fitur unik yang membedakan dari kompetitor</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-right px-3">
              <div className="flex flex-wrap justify-end gap-1">
                {productA.specs.features.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="inline-block px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[10px] font-medium text-[#2563EB]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right px-3">
              <div className="flex flex-wrap justify-end gap-1">
                {productB.specs.features.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="inline-block px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[10px] font-medium text-[#16A34A]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
