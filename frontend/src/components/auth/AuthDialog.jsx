import { useState } from "react";
import { X, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { isSupabaseEnabled } from "@/lib/supabase";
import { toast } from "sonner";

export function AuthDialog({ open, onClose, defaultTab = "login" }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSupabaseEnabled) {
      toast.error("Auth not configured");
      return;
    }
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
        toast.success("Signed in");
        onClose();
      } else {
        await register(email, password);
        toast.success("Account created — check your email to verify");
        setTab("login");
      }
    } catch (err) {
      toast.error(err.message || "Auth failed");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_48px_rgba(17,24,39,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111111]">
          <X size={16} strokeWidth={1.75} />
        </button>

        <h2 className="mb-1 text-lg font-semibold text-[#111111]">
          {tab === "login" ? "Sign in" : "Create account"}
        </h2>
        <p className="mb-5 text-sm text-[#6B7280]">
          {tab === "login" ? "Welcome back to MicroAgent" : "Start using MicroAgent for free"}
        </p>

        {/* Tab toggle */}
        <div className="mb-5 flex gap-1 rounded-xl bg-[#F3F4F6] p-1">
          {["login", "signup"].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
                tab === t ? "bg-white text-[#111111] shadow-sm" : "text-[#6B7280] hover:text-[#111111]"
              }`}
            >
              {t === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-xl border border-[#E5E7EB] py-2.5 pl-9 pr-3 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#3B6EF6]/50 focus:ring-2 focus:ring-[#3B6EF6]/10"
            />
          </div>
          <div className="relative">
            <Lock size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full rounded-xl border border-[#E5E7EB] py-2.5 pl-9 pr-10 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#3B6EF6]/50 focus:ring-2 focus:ring-[#3B6EF6]/10"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
              {showPw ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-[#111111] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2D2D2D] disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} strokeWidth={1.5} className="mx-auto animate-spin" /> : (tab === "login" ? "Sign in" : "Create account")}
          </button>
        </form>
      </div>
    </div>
  );
}
