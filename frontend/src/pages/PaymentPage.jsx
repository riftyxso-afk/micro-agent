import { useAuthModal } from "@/App";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Lock, Zap, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

// Base prices in IDR
const PLAN_DETAILS = {
  pro: {
    name: "Pro",
    idrMonthly: 50000,
    idrYearly: 480000, // ~20% discount
    credits: "2,000 credits / month",
    color: "#6366F1",
    bg: "bg-[#EEF2FF]",
    features: ["All 9 AI models", "Auto Mode", "Unlimited web search", "File analysis", "Chat history sync"],
  },
  ultra: {
    name: "Ultra",
    idrMonthly: 300000,
    idrYearly: 2880000, // ~20% discount
    credits: "10,000 credits / month",
    color: "#7C3AED",
    bg: "bg-[#F5F3FF]",
    features: ["Everything in Pro", "10,000 credits", "Priority answers", "Early access", "Dedicated support"],
  },
};

const PAKASIR_SLUG = process.env.REACT_APP_PAKASIR_SLUG || "";
const PAKASIR_API_KEY = process.env.REACT_APP_PAKASIR_API_KEY || "";
const formatIDR = (n) => `Rp ${n.toLocaleString("id-ID")}`;

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { openAuth } = useAuthModal();

  const planId = searchParams.get("plan") || "pro";
  const billingParam = searchParams.get("billing") || "monthly";

  const [billing, setBilling] = useState(billingParam);
  const [processing, setProcessing] = useState(false);

  const [form, setForm] = useState({
    email: user?.email || "",
    name: "",
  });

  const plan = PLAN_DETAILS[planId] || PLAN_DETAILS.pro;
  const idrPrice = billing === "yearly" ? plan.idrYearly : plan.idrMonthly;

  useEffect(() => {
    if (!user) {
      openAuth("login");
    }
  }, [user, openAuth, planId, billing]);

  const genOrderId = () => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `MA-${planId.toUpperCase()}-${ts}-${rand}`;
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Isi nama dan email terlebih dahulu");
      return;
    }
    if (!PAKASIR_SLUG) {
      toast.error("Payment gateway belum dikonfigurasi");
      return;
    }
    setProcessing(true);
    const orderId = genOrderId();
    // Create pending subscription in backend
    try {
      const token = user ? (await import("@/lib/supabase")).supabase?.auth.getSession().then(r => r.data?.session?.access_token) : null;
      await fetch(`${process.env.REACT_APP_API_URL || ""}/api/subscriptions/create-pending`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${await token}` } : {}) },
        body: JSON.stringify({ order_id: orderId, plan: planId, amount: idrPrice, billing }),
      });
    } catch (e) {
      console.warn("Could not create pending subscription:", e);
    }
    const redirectUrl = `${window.location.origin}/payment/success?plan=${planId}&order_id=${orderId}`;
    const url = `https://app.pakasir.com/pay/${PAKASIR_SLUG}/${idrPrice}?order_id=${orderId}&redirect=${encodeURIComponent(redirectUrl)}`;
    window.location.href = url;
  };

  if (!user) return null;

  return (
    <div className="min-h-dvh bg-[#F7F7F8]">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/pricing")}
            className="ma-focus grid h-9 w-9 place-items-center rounded-xl text-[#6B7280] hover:bg-[#F3F4F6]">
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <span className="text-base font-semibold text-[#111111]">Checkout</span>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Lock size={13} strokeWidth={1.75} />
            Secure checkout
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
        {/* Left: Payment form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Step 1: Contact */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#111111]">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#111111] text-[11px] font-bold text-white">1</span>
              Contact info
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Full name" placeholder="John Doe"
                value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
              <FormField label="Email" type="email" placeholder="you@example.com"
                value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
            </div>
          </div>

          {/* Step 2: Billing cycle */}
          <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#111111]">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#111111] text-[11px] font-bold text-white">2</span>
              Periode Berlangganan
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {["monthly", "yearly"].map((b) => (
                <button key={b} type="button" onClick={() => setBilling(b)}
                  className={`rounded-xl border-2 p-4 text-left transition-colors ${
                    billing === b ? "border-[#111111] bg-[#F7F7F8]" : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"
                  }`}
                >
                  <p className="text-sm font-semibold capitalize text-[#111111]">{b === "monthly" ? "Bulanan" : "Tahunan"}</p>
                  <p className="mt-0.5 text-xs font-medium text-[#374151]">
                    {formatIDR(b === "yearly" ? plan.idrYearly : plan.idrMonthly)}
                    {b === "yearly" ? " / tahun" : " / bulan"}
                  </p>
                  {b === "yearly" && (
                    <span className="mt-1.5 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      Hemat 20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Payment via Pakasir */}
          <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#111111]">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#111111] text-[11px] font-bold text-white">3</span>
              Pembayaran
            </h2>
            <form onSubmit={handlePayNow} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#F7F7F8] p-4">
                {["QRIS", "Transfer Bank", "BRI VA", "BNI VA", "BCA VA", "Mandiri VA"].map((m) => (
                  <div key={m} className="flex items-center gap-2 text-xs text-[#374151]">
                    <Check size={12} strokeWidth={2.5} className="shrink-0 text-emerald-500" />
                    {m}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-[#F0FDF4] px-3 py-2.5 text-xs text-[#166534]">
                <ShieldCheck size={14} strokeWidth={1.75} className="shrink-0 text-emerald-500" />
                Pembayaran aman melalui Pakasir · Berizin Bank Indonesia
              </div>

              <button type="submit" disabled={processing}
                className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#111111] text-sm font-semibold text-white transition-colors hover:bg-[#2D2D2D] disabled:opacity-60 active:scale-[0.98]">
                {processing
                  ? <><Loader2 size={18} className="animate-spin" /> Memproses...</>
                  : <>Bayar {formatIDR(idrPrice)} → Pilih Metode Pembayaran</>}
              </button>

              <p className="text-center text-[11px] text-[#9CA3AF]">
                Dengan berlangganan, kamu setuju dengan Syarat & Ketentuan. Batalkan kapan saja.
              </p>
            </form>
          </div>
        </motion.div>

        {/* Right: Order summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <div className="sticky top-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
            <h3 className="mb-4 text-sm font-semibold text-[#111111]">Order summary</h3>

            <div className={`flex items-center gap-3 rounded-xl ${plan.bg} p-4`}>
              <div className="flex-1">
                <p className="font-semibold text-[#111111]">MicroAgent {plan.name}</p>
                <p className="mt-0.5 text-xs text-[#6B7280]">{billing === "yearly" ? "Annual" : "Monthly"} subscription</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#111111]">{formatIDR(idrPrice)}</p>
                <p className="text-xs text-[#6B7280]">{billing === "yearly" ? "/tahun" : "/bulan"}</p>
              </div>
            </div>

            {billing === "yearly" && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-2.5 text-sm">
                <span className="text-emerald-700">Hemat per tahun</span>
                <span className="font-semibold text-emerald-700">
                  {formatIDR(plan.idrMonthly * 12 - plan.idrYearly)}
                </span>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between border-t border-[#F0F1F3] pt-4 text-sm">
                <span className="text-[#6B7280]">Subtotal</span>
                <span className="font-medium text-[#111111]">{formatIDR(idrPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Biaya admin</span>
                <span className="font-medium text-[#111111]">Termasuk</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#F0F1F3] pt-3 text-base">
                <span className="font-semibold text-[#111111]">Total</span>
                <span className="font-bold text-[#111111]">{formatIDR(idrPrice)}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Termasuk</p>
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-[#374151]">
                  <Check size={13} strokeWidth={2.5} className="shrink-0 text-emerald-500" />
                  {f}
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs text-[#374151]">
                <Zap size={13} strokeWidth={2} className="shrink-0 text-[#F59E0B]" />
                {plan.credits}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#F7F7F8] px-3 py-2.5">
              <img src="https://pakasir.com/favicon.ico" alt="Pakasir" className="h-4 w-4 rounded" onError={(e) => e.target.style.display='none'} />
              <p className="text-[11px] text-[#6B7280]">Pembayaran diproses oleh <span className="font-semibold text-[#374151]">Pakasir</span> · Berizin Bank Indonesia</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FormField({ label, placeholder, type = "text", value, onChange, required }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#374151]">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10"
      />
    </div>
  );
}
