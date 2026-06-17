import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Loader2, ArrowLeft, XCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("waiting"); // waiting | verifying | success | error
  const email = new URLSearchParams(window.location.search).get("email") || "";

  // Handle magic link confirmation from URL hash (Supabase redirects with #access_token=...)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes("access_token") || hash.includes("type=signup") || hash.includes("type=magiclink"))) {
      setStatus("verifying");
      supabase?.auth.getSession().then(({ data }) => {
        if (data?.session) {
          setStatus("success");
          toast.success("Email terverifikasi!");
          setTimeout(() => navigate("/home"), 2500);
        } else {
          setStatus("error");
        }
      });
    }
  }, [navigate]);

  // Listen for auth state change (if user clicks link in another tab)
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setStatus("success");
        toast.success("Email terverifikasi!");
        setTimeout(() => navigate("/home"), 2500);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  if (status === "verifying") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F7F7F8]">
        <Loader2 size={32} strokeWidth={1.5} className="animate-spin text-[#6366F1]" />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F7F7F8] px-4">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#F0FDF4]">
            <CheckCircle size={32} strokeWidth={1.5} className="text-emerald-500" />
          </div>
          <h1 className="text-xl font-semibold text-[#111111]">Email terverifikasi!</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Mengalihkan ke Home...</p>
        </motion.div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F7F7F8] px-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#FEF2F2]">
            <XCircle size={32} strokeWidth={1.5} className="text-[#EF4444]" />
          </div>
          <h1 className="text-xl font-semibold text-[#111111]">Link tidak valid</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Link sudah kadaluarsa. Coba daftar ulang.</p>
          <button onClick={() => navigate("/auth")}
            className="mt-5 rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2D2D2D]">
            Kembali ke Login
          </button>
        </motion.div>
      </div>
    );
  }

  // Default: waiting state — magic link sent
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F7F7F8] px-4 py-12">
      <button onClick={() => navigate("/auth")}
        className="mb-8 flex items-center gap-1.5 self-start text-sm text-[#6B7280] hover:text-[#111111]">
        <ArrowLeft size={15} strokeWidth={1.75} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }} className="w-full max-w-sm text-center">

        {/* Animated mail icon */}
        <motion.div
          initial={{ y: -5 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-[#EEF2FF] shadow-[0_8px_24px_rgba(99,102,241,0.15)]"
        >
          <Mail size={36} strokeWidth={1.25} className="text-[#6366F1]" />
        </motion.div>

        <h1 className="text-2xl font-semibold text-[#111111]">Cek emailmu</h1>
        <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
          Kami sudah mengirim magic link ke
        </p>
        {email && (
          <p className="mt-1 rounded-xl bg-white border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#111111] inline-block">
            {email}
          </p>
        )}
        <p className="mt-3 text-sm text-[#6B7280] leading-relaxed">
          Klik link di email untuk memverifikasi akunmu.
          <br />
          Halaman ini akan otomatis terupdate.
        </p>

        {/* Loading dots */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            className="h-2 w-2 rounded-full bg-[#6366F1]" />
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            className="h-2 w-2 rounded-full bg-[#6366F1]" />
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            className="h-2 w-2 rounded-full bg-[#6366F1]" />
        </div>
        <p className="mt-2 text-xs text-[#9CA3AF]">Menunggu verifikasi...</p>

        {/* Open email button */}
        <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2D2D2D] transition-colors">
          <ExternalLink size={14} strokeWidth={1.75} />
          Buka Gmail
        </a>

        <p className="mt-4 text-xs text-[#9CA3AF]">
          Tidak terima email? Cek folder spam atau{" "}
          <button onClick={() => navigate("/auth", { state: { tab: "register" } })}
            className="font-medium text-[#6366F1] hover:underline">
            daftar ulang
          </button>
        </p>
      </motion.div>
    </div>
  );
}
