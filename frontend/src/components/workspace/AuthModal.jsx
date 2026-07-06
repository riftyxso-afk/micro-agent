import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Chrome, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

export function AuthModal({ open, onClose, defaultTab = "login" }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [tab, setTab] = useState(defaultTab);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password);
      navigate(`/verify?email=${encodeURIComponent(email)}`);
      toast.success("Kode verifikasi dikirim ke emailmu");
      onClose();
    } catch (err) { toast.error(err.message || "Registration failed"); }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Signed in");
      onClose();
    } catch (err) { toast.error(err.message || "Login failed"); }
    setLoading(false);
  };

  const handleGoogle = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/home`,
        skipBrowserRedirect: false,
      },
    });
  };

  if (!open) return null;
  const isRegister = tab === "register";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-[#111] px-6 py-8 text-center">
            <button onClick={onClose} className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h2 className="font-heading text-xl font-semibold text-white">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mt-1 text-sm text-white/50">
              {isRegister ? "Join MicroAgent to unlock all features" : "Sign in to continue"}
            </p>
          </div>

          <div className="px-6 py-6 space-y-4">
            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogle}
              className="flex items-center justify-center gap-2.5 h-11 w-full rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#111111] hover:bg-[#F7F7F8] transition-colors"
            >
              <Chrome size={16} strokeWidth={1.75} />
              Continue with Google
            </button>

            <div className="relative flex items-center">
              <div className="flex-1 border-t border-[#E5E7EB]" />
              <span className="bg-white px-3 text-xs text-[#9CA3AF]">or</span>
              <div className="flex-1 border-t border-[#E5E7EB]" />
            </div>

            {/* Form */}
            <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-3">
              {isRegister && (
                <div className="grid grid-cols-2 gap-3">
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name"
                    className="h-11 rounded-xl border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#6366F1]" />
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name"
                    className="h-11 rounded-xl border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#6366F1]" />
                </div>
              )}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
                className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#6366F1]" />
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" required minLength={6}
                  className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3 pr-10 text-sm focus:outline-none focus:border-[#6366F1]" />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="h-11 w-full rounded-xl bg-[#111] text-sm font-medium text-white hover:bg-[#333] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                {isRegister ? "Create Account" : "Sign In"}
              </button>
            </form>

            <p className="text-center text-xs text-[#9CA3AF]">
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <button onClick={() => setTab(isRegister ? "login" : "register")} className="font-medium text-[#6366F1] hover:underline">
                {isRegister ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
