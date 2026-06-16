import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Zap, ArrowRight, Home, Loader2, XCircle, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "@/lib/chatApi";
import { useAuth } from "@/lib/AuthContext";

const PLAN_NAMES = { pro: "Pro", ultra: "Ultra" };
const PLAN_CREDITS = { pro: "2.000 credits", ultra: "10.000 credits" };

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();

  const plan = searchParams.get("plan") || "pro";
  const orderId = searchParams.get("order_id") || "";

  const [status, setStatus] = useState("verifying"); // verifying | active | pending | failed
  const [attempts, setAttempts] = useState(0);

  const verify = async () => {
    if (!orderId) { setStatus("active"); return; } // no order to verify
    try {
      const token = session?.access_token;
      const res = await fetch(`${API_BASE_URL}/api/subscriptions/verify/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.status === "active") {
        setStatus("active");
      } else {
        setStatus("pending");
      }
    } catch {
      setStatus("pending");
    }
  };

  useEffect(() => {
    verify();
  }, [orderId, session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-retry up to 5 times (Pakasir webhook may come in seconds)
  useEffect(() => {
    if (status !== "pending" || attempts >= 5) return;
    const t = setTimeout(() => {
      setAttempts((a) => a + 1);
      verify();
    }, 3000);
    return () => clearTimeout(t);
  }, [status, attempts]); // eslint-disable-line react-hooks/exhaustive-deps

  // If still pending after 5 retries, mark as failed
  useEffect(() => {
    if (status === "pending" && attempts >= 5) {
      setStatus("failed");
    }
  }, [status, attempts]);

  // Auto-redirect on success
  useEffect(() => {
    if (status !== "active") return;
    const t = setTimeout(() => navigate("/home"), 6000);
    return () => clearTimeout(t);
  }, [status, navigate]);

  if (status === "verifying") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F7F7F8] gap-3">
        <Loader2 size={32} strokeWidth={1.5} className="animate-spin text-[#6B7280]" />
        <p className="text-sm text-[#6B7280]">Memverifikasi pembayaran...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F7F7F8] px-4">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }} className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-[#FEF2F2] ring-8 ring-[#FEF2F2]">
            <XCircle size={40} strokeWidth={1.5} className="text-[#EF4444]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#111111]">Pembayaran belum terkonfirmasi</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Pembayaran mungkin masih diproses. Jika sudah bayar, tunggu beberapa menit lalu cek lagi.
          </p>
          <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <p className="text-[11px] text-[#9CA3AF]">Order ID</p>
            <p className="mt-0.5 font-mono text-xs font-medium text-[#374151]">{orderId}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button onClick={() => { setAttempts(0); setStatus("pending"); }}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] hover:bg-[#F7F7F8]">
              <RefreshCw size={14} strokeWidth={1.75} /> Cek lagi
            </button>
            <button onClick={() => navigate("/pricing")}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111111] text-sm font-medium text-white hover:bg-[#2D2D2D]">
              Kembali ke Pricing
            </button>
          </div>
          <p className="mt-4 text-xs text-[#9CA3AF]">
            Butuh bantuan? Hubungi support dengan Order ID di atas.
          </p>
        </motion.div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F7F7F8] gap-3">
        <Loader2 size={28} strokeWidth={1.5} className="animate-spin text-[#F59E0B]" />
        <p className="text-sm font-medium text-[#374151]">Menunggu konfirmasi pembayaran...</p>
        <p className="text-xs text-[#9CA3AF]">Percobaan {attempts}/5</p>
      </div>
    );
  }

  // status === "active"
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F7F7F8] px-4 py-12">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-[#F0FDF4] ring-8 ring-[#F0FDF4]">
          <CheckCircle size={40} strokeWidth={1.5} className="text-emerald-500" />
        </div>
        <h1 className="text-2xl font-semibold text-[#111111]">Pembayaran berhasil!</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Selamat! Kamu sekarang berlangganan MicroAgent{" "}
          <span className="font-semibold text-[#111111]">{PLAN_NAMES[plan] || plan}</span>.
        </p>

        <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 text-left shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F4F6]">
              <Zap size={18} strokeWidth={1.75} className="text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111111]">MicroAgent {PLAN_NAMES[plan] || plan}</p>
              <p className="text-xs text-[#6B7280]">{PLAN_CREDITS[plan] || ""} sudah aktif</p>
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
          <button onClick={() => navigate("/home")}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] hover:bg-[#F7F7F8]">
            <Home size={15} strokeWidth={1.75} /> Home
          </button>
          <button onClick={() => navigate("/chat")}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111111] text-sm font-medium text-white hover:bg-[#2D2D2D]">
            Mulai chat <ArrowRight size={15} strokeWidth={1.75} />
          </button>
        </div>
        <p className="mt-4 text-xs text-[#9CA3AF]">Mengalihkan ke Home dalam 6 detik...</p>
      </motion.div>
    </div>
  );
}
