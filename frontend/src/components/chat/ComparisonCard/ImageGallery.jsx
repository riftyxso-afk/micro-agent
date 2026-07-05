import { useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("comparison-gallery");
    if (!container) return;
    const scrollAmount = 200;
    const newPosition =
      direction === "left"
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount;
    container.scrollTo({ left: newPosition, behavior: "smooth" });
    setScrollPosition(newPosition);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
          Gambar Relevan
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="ma-focus w-6 h-6 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] hover:bg-[#F7F7F8] transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="ma-focus w-6 h-6 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] hover:bg-[#F7F7F8] transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div
        id="comparison-gallery"
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollBehavior: "smooth" }}
      >
        {images.map((url, idx) => (
          <div
            key={idx}
            className="shrink-0 w-[140px] h-[140px] rounded-xl border border-[#E5E7EB] bg-[#F7F7F8] overflow-hidden flex items-center justify-center"
          >
            <img
              src={url}
              alt={`Gambar produk ${idx + 1}`}
              className="w-full h-full object-contain p-2"
              loading="lazy"
              onError={(e) => {
                const target = e.target;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent && !parent.querySelector(".fallback-icon")) {
                  const fallback = document.createElement("div");
                  fallback.className = "fallback-icon flex flex-col items-center gap-1 text-[#9CA3AF]";
                  fallback.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-[10px]">Gambar</span>';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
