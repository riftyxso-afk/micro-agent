import { ExternalLink, Star, Truck, Shield } from "lucide-react";
import type { StoreListing } from "./types";
import { MARKETPLACE_COLORS } from "./types";

interface StorePricesProps {
  label: string;
  stores: StoreListing[];
}

const formatPrice = (price: number) =>
  `Rp ${price.toLocaleString("id-ID")}`;

const StoreCard = ({ store }: { store: StoreListing }) => {
  const marketplaceColor = MARKETPLACE_COLORS[store.marketplace] || "#6B7280";

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(17,24,39,0.06)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: marketplaceColor }}
          >
            {store.marketplace.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#111111] truncate">
              {store.storeName}
            </p>
            <p className="text-[10px] text-[#6B7280]">{store.marketplace}</p>
          </div>
        </div>
        <a
          href={store.url}
          target="_blank"
          rel="noreferrer"
          className="ma-focus shrink-0 inline-flex items-center gap-1 text-[10px] text-[#6B7280] hover:text-[#2563EB] transition-colors"
        >
          Kunjungi
          <ExternalLink size={10} />
        </a>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <span className="text-sm font-bold text-[#111111]">
          {formatPrice(store.price)}
        </span>
        <div className="flex items-center gap-1">
          <Star size={10} className="text-[#F59E0B] fill-[#F59E0B]" />
          <span className="text-[11px] font-medium text-[#374151]">
            {store.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-[10px] text-[#6B7280]">
        <span className="inline-flex items-center gap-1">
          <Truck size={10} />
          {store.shipping}
        </span>
        {store.badge && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] font-medium">
            <Shield size={8} />
            {store.badge}
          </span>
        )}
      </div>
    </div>
  );
};

export const StorePrices = ({ label, stores }: StorePricesProps) => {
  if (!stores || stores.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4 text-center">
        <p className="text-xs text-[#9CA3AF]">Belum ada data harga</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-xs font-semibold text-[#6B7280] mb-2 uppercase tracking-wider">
        {label}
      </h4>
      <div className="space-y-2">
        {stores.map((store, idx) => (
          <StoreCard key={`${store.marketplace}-${idx}`} store={store} />
        ))}
      </div>
    </div>
  );
};
