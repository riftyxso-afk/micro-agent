import { useState } from "react";
import { Scale, MessageSquare, Send, ArrowLeftRight } from "lucide-react";
import { SpecsTable } from "./SpecsTable";
import { StorePrices } from "./StorePrices";
import { ImageGallery } from "./ImageGallery";
import { AiInsight } from "./AiInsight";

const DUMMY_AI_REPLIES = {
  gaming:
    "Untuk kebutuhan gaming, Samsung Galaxy S26 Ultra dengan RAM 12GB dan layar 144Hz lebih direkomendasikan. Performa Snapdragon 8 Gen 4 sangat optimal untuk game berat.",
  kamera:
    "Untuk fotografi, iPhone 16 Pro Max memiliki keunggulan di computational photography dan video recording. Namun Samsung unggul di resolusi sensor 200MP.",
  baterai:
    "Samsung Galaxy S26 Ultra memiliki baterai lebih besar (5000mAh vs 4422mAh), namun iPhone biasanya lebih efisien karena optimasi iOS.",
  harga:
    "Samsung Galaxy S26 Ultra memiliki harga rata-rata lebih rendah Rp 2.000.000 dibandingkan iPhone 16 Pro Max. Harga terbaik bisa dilihat di daftar toko di atas.",
  default:
    "Tentu! Untuk kebutuhan gaming, Samsung Galaxy S26 Ultra dengan RAM 12GB dan layar 144Hz lebih direkomendasikan. Ada pertanyaan lain?",
};

export const ComparisonCard = ({ data }) => {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMsg = { role: "user", text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);

    const lowerInput = chatInput.toLowerCase();
    let aiReply = DUMMY_AI_REPLIES.default;

    if (lowerInput.includes("gaming") || lowerInput.includes("game")) {
      aiReply = DUMMY_AI_REPLIES.gaming;
    } else if (
      lowerInput.includes("kamera") ||
      lowerInput.includes("foto") ||
      lowerInput.includes("photo")
    ) {
      aiReply = DUMMY_AI_REPLIES.kamera;
    } else if (
      lowerInput.includes("baterai") ||
      lowerInput.includes("battery")
    ) {
      aiReply = DUMMY_AI_REPLIES.baterai;
    } else if (
      lowerInput.includes("harga") ||
      lowerInput.includes("price") ||
      lowerInput.includes("murah")
    ) {
      aiReply = DUMMY_AI_REPLIES.harga;
    }

    setTimeout(() => {
      setChatMessages((prev) => [...prev, { role: "ai", text: aiReply }]);
    }, 500);

    setChatInput("");
  };

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(17,24,39,0.06)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#F0F1F3] bg-[#FAFAFA]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
            <Scale size={14} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">
              Perbandingan Produk
            </h3>
            <p className="text-[11px] text-[#6B7280]">
              {data.productA.name} vs {data.productB.name}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Desktop: Side by side */}
        <div className="hidden md:grid md:grid-cols-[1fr_340px] gap-4">
          {/* Left: Specs Table */}
          <SpecsTable
            productA={data.productA}
            productB={data.productB}
          />

          {/* Right: Store Prices */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowLeftRight size={14} className="text-[#6B7280]" />
              <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Harga Antar Toko
              </h4>
            </div>
            <StorePrices
              label={data.productA.name}
              stores={data.stores.productA}
            />
            <StorePrices
              label={data.productB.name}
              stores={data.stores.productB}
            />
            <AiInsight
              insight={data.aiInsight}
              productAName={data.productA.name}
              productBName={data.productB.name}
            />
          </div>
        </div>

        {/* Mobile: Stacked */}
        <div className="md:hidden space-y-4">
          <SpecsTable
            productA={data.productA}
            productB={data.productB}
          />

          <div className="border-t border-[#F0F1F3] pt-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowLeftRight size={14} className="text-[#6B7280]" />
              <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Harga Antar Toko
              </h4>
            </div>
            <div className="space-y-4">
              <StorePrices
                label={data.productA.name}
                stores={data.stores.productA}
              />
              <StorePrices
                label={data.productB.name}
                stores={data.stores.productB}
              />
            </div>
          </div>

          <div className="border-t border-[#F0F1F3] pt-4">
            <AiInsight
              insight={data.aiInsight}
              productAName={data.productA.name}
              productBName={data.productB.name}
            />
          </div>
        </div>

        {/* Image Gallery */}
        {data.images && data.images.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#F0F1F3]">
            <ImageGallery images={data.images} />
          </div>
        )}
      </div>

      {/* Mini Chat */}
      <div className="border-t border-[#F0F1F3] bg-[#FAFAFA] p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={14} className="text-[#6B7280]" />
          <p className="text-xs text-[#6B7280]">
            Tanyakan detail lebih lanjut tentang perbandingan ini ke AI...
          </p>
        </div>

        {chatMessages.length > 0 && (
          <div className="mb-3 space-y-2 max-h-[120px] overflow-y-auto">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-1.5 rounded-xl text-xs ${
                    msg.role === "user"
                      ? "bg-[#2563EB] text-white rounded-br-md"
                      : "bg-white border border-[#E5E7EB] text-[#374151] rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
            placeholder="Contoh: Mana yang lebih bagus untuk gaming?"
            className="ma-focus flex-1 h-9 rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs text-[#111111] placeholder:text-[#9CA3AF] transition-colors focus:border-[#2563EB] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleChatSend}
            disabled={!chatInput.trim()}
            className="ma-focus h-9 w-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
