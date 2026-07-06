import { useAuthModal } from "@/App";
const { openAuth } = useAuthModal();
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Zap,
  Check,
  Loader2,
  CreditCard,
  Sparkles,
  TrendingUp,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { API_BASE_URL } from "@/lib/chatApi";
import { Sidebar } from "@/components/workspace/Sidebar";
import { MobileNav } from "@/components/workspace/MobileNav";
import { UserMenu } from "@/components/workspace/UserMenu";
import { HistoryDialog } from "@/components/workspace/HistoryDialog";
import { ProjectsDialog } from "@/components/workspace/ProjectsDialog";
import { MoreDialog } from "@/components/workspace/MoreDialog";

const TOKEN_PACKAGES = [
  {
    id: "starter",
    tokens: 100,
    price: 10000,
    perToken: 100,
    badge: null,
    color: "#6B7280",
    desc: "Cukup untuk ~50-100 chat",
    messages: "50–100 pesan",
  },
  {
    id: "popular",
    tokens: 500,
    price: 40000,
    perToken: 80,
    badge: "BEST VALUE",
    color: "#6366F1",
    desc: "Hemat 20%, cukup untuk ~250-500 chat",
    messages: "250–500 pesan",
  },
  {
    id: "mega",
    tokens: 1500,
    price: 100000,
    perToken: 67,
    badge: "HEMAT 33%",
    color: "#7C3AED",
    desc: "Hemat 33%, cukup untuk ~750-1500 chat",
    messages: "750–1.500 pesan",
  },
];

const formatIDR = (n) => `Rp ${n.toLocaleString("id-ID")}`;

const PAKASIR_SLUG = process.env.REACT_APP_PAKASIR_SLUG || "";

export default function TopUpPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [activeDialog, setActiveDialog] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState("popular");
  const [processing, setProcessing] = useState(false);
  const [balance, setBalance] = useState(null);
  const [activeNav, setActiveNav] = useState("new");
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState(null);

  useEffect(() => {
    if (!user) {
      openAuth("login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE_URL}/api/credits/${user.id}`)
      .then((r) => r.json())
      .then((d) => setBalance(d.balance ?? 0))
      .catch(() => {});
  }, [user]);

  const handleNavChange = (navId) => {
    setActiveNav(navId);
    if (navId === "history" || navId === "projects" || navId === "more") {
      setActiveDialog(navId);
    }
  };

  const genOrderId = () => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `MA-TOPUP-${ts}-${rand}`;
  };

  const handleTopUp = async () => {
    if (!user) {
      openAuth("login");
      return;
    }
    const pkg = TOKEN_PACKAGES.find((p) => p.id === selectedPkg);
    if (!pkg) return;

    if (!PAKASIR_SLUG) {
      // Fallback: direct top-up via backend (for testing)
      setProcessing(true);
      try {
        const session = await (
          await import("@/lib/supabase")
        ).supabase?.auth.getSession();
        const authToken = session?.data?.session?.access_token;
        const res = await fetch(`${API_BASE_URL}/api/credits/topup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            user_id: user.id,
            amount: pkg.tokens,
            type: "topup",
          }),
        });
        const data = await res.json();
        if (data.balance != null) {
          setBalance(data.balance);
          toast.success(`${pkg.tokens} token berhasil ditambahkan!`, {
            description: `Saldo sekarang: ${data.balance} token`,
          });
        } else {
          throw new Error(data.error || "Gagal top up");
        }
      } catch (err) {
        toast.error("Gagal top up", { description: err.message });
      } finally {
        setProcessing(false);
      }
      return;
    }

    // Pakasir payment flow
    setProcessing(true);
    const orderId = genOrderId();
    try {
      const session = await (
        await import("@/lib/supabase")
      ).supabase?.auth.getSession();
      const authToken = session?.data?.session?.access_token;

      // Create pending order in backend
      await fetch(`${API_BASE_URL}/api/subscriptions/create-pending`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          order_id: orderId,
          plan: "topup",
          amount: pkg.price,
        }),
      });

      // Redirect to Pakasir with correct URL format
      const redirectUrl = `${window.location.origin}/topup/success?order=${orderId}&tokens=${pkg.tokens}`;
      const url = `https://app.pakasir.com/pay/${PAKASIR_SLUG}/${pkg.price}?order_id=${orderId}&redirect=${encodeURIComponent(redirectUrl)}`;
      window.location.href = url;
    } catch (err) {
      toast.error("Gagal memulai pembayaran", { description: err.message });
      setProcessing(false);
    }
  };

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoStatus("checking");
    try {
      const session = await (
        await import("@/lib/supabase")
      ).supabase?.auth.getSession();
      const authToken = session?.data?.session?.access_token;
      const res = await fetch(`${API_BASE_URL}/api/promo/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ code: promoCode, user_id: user?.id }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoStatus(data);
      } else {
        setPromoStatus({ error: data.error || "Kode tidak valid" });
      }
    } catch {
      setPromoStatus({ error: "Gagal memvalidasi kode" });
    }
  };

  const handleRedeemPromo = async () => {
    if (!user) return;
    try {
      const session = await (
        await import("@/lib/supabase")
      ).supabase?.auth.getSession();
      const authToken = session?.data?.session?.access_token;
      const res = await fetch(`${API_BASE_URL}/api/promo/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ code: promoCode, user_id: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Promo berhasil!", { description: data.desc });
        setPromoCode("");
        setPromoStatus(null);
        // Refresh balance
        const balRes = await fetch(`${API_BASE_URL}/api/credits/${user.id}`);
        const balData = await balRes.json();
        if (balData.balance != null) setBalance(balData.balance);
      } else {
        toast.error(data.error || "Gagal redeem promo");
      }
    } catch {
      toast.error("Gagal redeem promo");
    }
  };

  const fadeUp = (d = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: d, ease: [0.25, 0.46, 0.45, 0.94] },
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F7F7F8" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} activeNav={activeNav} onNavChange={handleNavChange} />
      <MobileNav activeNav={activeNav} onNavChange={handleNavChange} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[520px] px-4 py-6 sm:px-6 sm:py-10">
          {/* Header */}
          <motion.div {...fadeUp(0)}>
            <div className="mb-6 flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="ma-focus grid h-9 w-9 place-items-center rounded-xl text-[#6B7280] transition-colors hover:bg-[#E5E7EB] hover:text-[#111111]"
              >
                <ArrowLeft size={18} strokeWidth={1.75} />
              </button>
              <div>
                <h1 className="font-heading text-xl font-semibold text-[#111111]">Top Up Token</h1>
                <p className="text-xs text-[#6B7280]">Tambah token untuk terus menggunakan AI</p>
              </div>
            </div>
          </motion.div>

          {/* Current balance */}
          <motion.div {...fadeUp(0.05)}>
            <div className="mb-5 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EEF2FF]">
                    <Zap size={18} strokeWidth={1.75} className="text-[#6366F1]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Saldo saat ini</p>
                    <p className="font-heading text-xl font-semibold text-[#111111]">
                      {balance != null ? balance : "—"}
                      <span className="ml-1 text-sm font-normal text-[#6B7280]">token</span>
                    </p>
                  </div>
                </div>
                {balance != null && balance <= 5 && (
                  <span className="rounded-full bg-[#FEF2F2] px-2.5 py-1 text-[11px] font-semibold text-[#EF4444]">
                    Habis
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Token packages */}
          <motion.div {...fadeUp(0.1)}>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Pilih Paket</p>
            <div className="space-y-3">
              {TOKEN_PACKAGES.map((pkg) => {
                const isSelected = selectedPkg === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPkg(pkg.id)}
                    className={`relative w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-[#6366F1] bg-white shadow-[0_0_0_1px_#6366F1,0_4px_16px_rgba(99,102,241,0.1)]"
                        : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-[0_2px_8px_rgba(17,24,39,0.06)]"
                    }`}
                  >
                    {pkg.badge && (
                      <span
                        className="absolute -top-2.5 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: pkg.color }}
                      >
                        {pkg.badge}
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-11 w-11 place-items-center rounded-xl transition-colors ${
                            isSelected ? "bg-[#EEF2FF]" : "bg-[#F7F7F8]"
                          }`}
                        >
                          <Sparkles
                            size={18}
                            strokeWidth={1.75}
                            className={isSelected ? "text-[#6366F1]" : "text-[#6B7280]"}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#111111]">
                              {pkg.tokens.toLocaleString()} token
                            </span>
                            {isSelected && (
                              <span className="grid h-4 w-4 place-items-center rounded-full bg-[#6366F1]">
                                <Check size={10} strokeWidth={3} className="text-white" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#6B7280]">{pkg.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#111111]">{formatIDR(pkg.price)}</p>
                        <p className="text-[10px] text-[#9CA3AF]">{formatIDR(pkg.perToken)}/token</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Info cards */}
          <motion.div {...fadeUp(0.15)}>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { icon: Zap, label: "Instan", desc: "Langsung masuk" },
                { icon: Shield, label: "Aman", desc: "Pembayaran aman" },
                { icon: TrendingUp, label: "Hemat", desc: "Paket lebih murah" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white border border-[#E5E7EB] p-3 text-center">
                  <item.icon size={14} strokeWidth={1.75} className="mx-auto mb-1 text-[#6B7280]" />
                  <p className="text-[11px] font-semibold text-[#111111]">{item.label}</p>
                  <p className="text-[9px] text-[#9CA3AF]">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div {...fadeUp(0.2)}>
            <button
              onClick={handleTopUp}
              disabled={processing}
              className="ma-focus mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(17,24,39,0.2)] transition-all duration-200 hover:bg-[#2D2D2D] hover:shadow-[0_6px_20px_rgba(17,24,39,0.25)] active:scale-[0.98] disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard size={16} strokeWidth={1.75} />
                  Bayar {formatIDR(TOKEN_PACKAGES.find((p) => p.id === selectedPkg)?.price || 0)}
                </>
              )}
            </button>
            <p className="mt-3 text-center text-[11px] text-[#9CA3AF]">
              Pembayaran diproses oleh Pakasir · Token masuk otomatis
            </p>

            {/* Promo Code */}
            <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Kode Promo</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoStatus(null); }}
                  placeholder="Masukkan kode promo"
                  className="ma-focus flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111111] placeholder:text-[#9CA3AF] transition-colors focus:border-[#6366F1] focus:outline-none"
                />
                {promoStatus && promoStatus.valid ? (
                  <button
                    onClick={handleRedeemPromo}
                    className="ma-focus rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 active:scale-[0.98]"
                  >
                    Pakai
                  </button>
                ) : (
                  <button
                    onClick={handleValidatePromo}
                    disabled={!promoCode.trim() || promoStatus === "checking"}
                    className="ma-focus rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111111] transition-colors hover:bg-[#F3F4F6] disabled:opacity-50"
                  >
                    {promoStatus === "checking" ? "Cek..." : "Cek"}
                  </button>
                )}
              </div>
              {promoStatus === "checking" && (
                <p className="mt-1.5 text-[11px] text-[#6B7280]">Memeriksa kode...</p>
              )}
              {promoStatus && promoStatus.valid && (
                <p className="mt-1.5 text-[11px] font-medium text-emerald-600">{promoStatus.desc}</p>
              )}
              {promoStatus && promoStatus.error && (
                <p className="mt-1.5 text-[11px] font-medium text-red-500">{promoStatus.error}</p>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <MobileNav activeNav={activeNav} onNavChange={handleNavChange} />

      <HistoryDialog
        open={activeDialog === "history"}
        onOpenChange={(open) => setActiveDialog(open ? "history" : null)}
      />
      <ProjectsDialog
        open={activeDialog === "projects"}
        onOpenChange={(open) => setActiveDialog(open ? "projects" : null)}
      />
      <MoreDialog
        open={activeDialog === "more"}
        onOpenChange={(open) => setActiveDialog(open ? "more" : null)}
      />
    </div>
  );
}
