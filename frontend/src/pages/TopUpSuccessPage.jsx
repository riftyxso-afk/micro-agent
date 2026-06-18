import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Zap, ArrowRight, Home, Loader2, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "@/lib/chatApi";
import { useAuth } from "@/lib/AuthContext";

export default function TopUpSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();

  const orderId = searchParams.get("order") || "";
  const tokens = parseInt(searchParams.get("tokens") || "0", 10);

  const [status, setStatus] = useState("verifying"); // verifying | success | pending | failed
  const [attempts, setAttempts] = useState(0);

  const verify = useCallback(async () => {
    if (!orderId) { setStatus("success"); return; }
    try {
      const token = session?.access_token;
      const res = await fetch(`${API_BASE_URL}/api/subscriptions/verify/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.status === "active") {
        setStatus("success");
      } else {
        setStatus("pending");
      }
    } catch {
      setStatus("pending");
    }
  }, [orderId, session]);

  useEffect(() => {
    if (status !== "pending" || attempts >= 10) return;
    const timer = setTimeout(() => {
      verify();
      setAttempts((a) => a + 1);
    }, attempts === 0 ? 2000 : 3000);
    return () => clearTimeout(timer);
  }, [status, attempts, verify]);

  useEffect(() => {
    verify();
  }, [verify]);

  return (
    <div className="min-h-dvh bg-[#F7F7F8] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="w-full max-w-md"
      >
        <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_8px_32px_rgba(17,24,39,0.06)]">
          {/* Status icon */}
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#F0FDF4]">
            {status === "verifying" && (
              <Loader2 size={28} strokeWidth={1.75} className="animate-spin text-[#6366F1]" />
            )}
            {status === "success" && (
              <CheckCircle size={28} strokeWidth={1.75} className="text-emerald-500" />
            )}
            {status === "pending" && (
              <RefreshCw size={28} strokeWidth={1.75} className="animate-spin text-[#F59E0B]" />
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading text-xl font-semibold text-[#111111]">
            {status === "verifying" && "Memverifikasi pembayaran..."}
            {status === "success" && "Token berhasil ditambahkan!"}
            {status === "pending" && "Menunggu konfirmasi..."}
          </h1>

          {/* Token info */}
          {tokens > 0 && status === "success" && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-4 py-2">
              <Zap size={16} strokeWidth={2} className="text-[#6366F1]" />
              <span className="text-sm font-semibold text-[#6366F1]">
                +{tokens.toLocaleString()} token
              </span>
            </div>
          )}

          <p className="mt-3 text-sm text-[#6B7280]">
            {status === "verifying" && "Tunggu sebentar, kami memeriksa status pembayaran Anda."}
            {status === "success" && "Token sudah masuk ke saldo Anda. Selamat menggunakan AI!"}
            {status === "pending" && `Percobaan ${attempts}/10 — pembayaran sedang diproses.`}
          </p>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-2">
            {status === "success" && (
              <button
                onClick={() => navigate("/home")}
                className="ma-focus flex items-center justify-center gap-2 rounded-2xl bg-[#111111] py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#2D2D2D] active:scale-[0.98]"
              >
                Mulai Chat
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            )}
            <button
              onClick={() => navigate("/topup")}
              className="ma-focus flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white py-3 text-sm font-medium text-[#111111] transition-all duration-200 hover:bg-[#F7F7F8] active:scale-[0.98]"
            >
              <Home size={15} strokeWidth={1.75} />
              Kembali ke Top Up
            </button>
          </div>

          {/* Retry */}
          {status === "pending" && attempts < 10 && (
            <button
              onClick={() => { verify(); setAttempts((a) => a + 1); }}
              className="ma-focus mt-3 inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111111]"
            >
              <RefreshCw size={12} strokeWidth={2} />
              Cek ulang sekarang
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
