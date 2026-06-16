import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Zap, ArrowRight, Home } from "lucide-react";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "pro";
  const orderId = searchParams.get("order_id") || "";

  const planNames = { pro: "Pro", ultra: "Ultra" };
  const planCredits = { pro: "2.000 credits", ultra: "10.000 credits" };
  const planName = planNames[plan] || plan;

  useEffect(() => {
    // Auto-redirect to home after 8 seconds
    const t = setTimeout(() => navigate("/home"), 8000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F7F7F8] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="w-full max-w-md text-center"
      >
        {/* Icon */}
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-[#F0FDF4] ring-8 ring-[#F0FDF4]">
          <CheckCircle size={40} strokeWidth={1.5} className="text-emerald-500" />
        </div>

        <h1 className="text-2xl font-semibold text-[#111111]">
          Pembayaran berhasil!
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Selamat! Kamu sekarang berlangganan MicroAgent <span className="font-semibold text-[#111111]">{planName}</span>.
        </p>

        <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 text-left shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F4F6]">
              <Zap size={18} strokeWidth={1.75} className="text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111111]">MicroAgent {planName}</p>
              <p className="text-xs text-[#6B7280]">{planCredits[plan] || ""} sudah ditambahkan</p>
            </div>
          </div>

          {orderId && (
            <div className="mt-4 rounded-xl bg-[#F7F7F8] px-3 py-2">
              <p className="text-[11px] text-[#9CA3AF]">Order ID</p>
              <p className="mt-0.5 font-mono text-xs font-medium text-[#374151]">{orderId}</p>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/home")}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] transition-colors hover:bg-[#F7F7F8]"
          >
            <Home size={15} strokeWidth={1.75} />
            Home
          </button>
          <button
            onClick={() => navigate("/chat")}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111111] text-sm font-medium text-white transition-colors hover:bg-[#2D2D2D]"
          >
            Mulai chat
            <ArrowRight size={15} strokeWidth={1.75} />
          </button>
        </div>

        <p className="mt-4 text-xs text-[#9CA3AF]">Mengalihkan ke Home dalam 8 detik...</p>
      </motion.div>
    </div>
  );
}
