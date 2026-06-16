import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Circle, Chrome, Github, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

const STEPS = [
  { number: 1, text: "Register your identity", active: true },
  { number: 2, text: "Configure your workspace" },
  { number: 3, text: "Finalize your profile" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const from = location.state?.from || "/home";
  const defaultTab = location.state?.tab || "register";

  const [tab, setTab] = useState(defaultTab);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password);
      toast.success("Account created — check your email to verify");
      setTab("login");
    } catch (err) { toast.error(err.message || "Registration failed"); }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Signed in");
      navigate(from, { replace: true });
    } catch (err) { toast.error(err.message || "Login failed"); }
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!supabase) { toast.error("Auth not configured"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?tab=login`,
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (err) { toast.error(err.message || "Failed"); }
    setLoading(false);
  };

  const isRegister = tab === "register";

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      {/* Left column — Hero */}
      <motion.div
        variants={containerVariants} initial="hidden" animate="show"
        className="relative hidden w-[52%] flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full lg:flex"
      >
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 w-full max-w-xs space-y-8">
          <motion.div variants={itemVariants} className="flex items-center gap-2">
            <Circle size={18} className="fill-white text-white" />
            <span className="text-xl font-semibold tracking-tight text-white">MicroAgent</span>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 className="text-4xl font-medium tracking-tight whitespace-nowrap text-white">
              {isRegister ? "Join MicroAgent" : "Welcome back"}
            </h1>
            <p className="mt-2 text-white/60 text-sm leading-relaxed px-4">
              {isRegister ? "Follow these 3 quick steps to activate your workspace." : "Sign in to continue your AI journey."}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            {STEPS.map((s) => <StepItem key={s.number} {...s} />)}
          </motion.div>
        </div>
      </motion.div>

      {/* Right column — Form */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <Circle size={16} className="fill-white text-white" />
            <span className="text-lg font-semibold tracking-tight text-white">MicroAgent</span>
          </div>

          <div>
            <h2 className="text-3xl font-medium tracking-tight text-white">
              {tab === "login" ? "Sign in" : tab === "forgot" ? "Reset password" : "Create New Profile"}
            </h2>
            <p className="mt-1 text-white/40 text-sm">
              {tab === "login" ? "Welcome back. Enter your credentials to continue." :
               tab === "forgot" ? "Enter your email and we'll send a reset link." :
               "Input your basic details to begin the journey."}
            </p>
          </div>

          {/* Tab toggle */}
          {tab !== "forgot" && (
            <div className="flex gap-1 rounded-xl bg-white/5 p-1">
              {["register", "login"].map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    tab === t ? "bg-white text-black" : "text-white/40 hover:text-white"
                  }`}
                >
                  {t === "login" ? "Sign in" : "Sign up"}
                </button>
              ))}
            </div>
          )}

          {/* Social buttons (register only) */}
          {tab === "register" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <SocialButton icon={Chrome} label="Google" />
                <SocialButton icon={Github} label="GitHub" />
              </div>
              <div className="relative flex items-center">
                <div className="flex-1 border-t border-white/10" />
                <span className="bg-black px-4 text-xs font-medium text-white/40 uppercase tracking-widest">Or</span>
                <div className="flex-1 border-t border-white/10" />
              </div>
            </>
          )}

          {/* Register form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" placeholder="John" value={firstName} onChange={setFirstName} />
                <InputGroup label="Last Name" placeholder="Doe" value={lastName} onChange={setLastName} />
              </div>
              <InputGroup label="Email" placeholder="you@example.com" type="email" value={email} onChange={setEmail} required />
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters" required minLength={8}
                    className="w-full h-11 bg-[#1A1A1A] border-none rounded-xl px-4 pr-11 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPw ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-white/30">Requires at least 8 symbols.</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all mt-4 disabled:opacity-50 flex items-center justify-center">
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Create Account"}
              </button>
              <p className="text-center text-sm text-white/40">
                Already a member?{" "}
                <button type="button" onClick={() => setTab("login")} className="text-white font-medium hover:underline">Log in</button>
              </p>
            </form>
          )}

          {/* Login form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <InputGroup label="Email" placeholder="you@example.com" type="email" value={email} onChange={setEmail} required />
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-white">Password</label>
                  <button type="button" onClick={() => setTab("forgot")} className="text-xs text-white/40 hover:text-white">Forgot password?</button>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password" required
                    className="w-full h-11 bg-[#1A1A1A] border-none rounded-xl px-4 pr-11 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPw ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all mt-4 disabled:opacity-50 flex items-center justify-center">
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In"}
              </button>
              <p className="text-center text-sm text-white/40">
                New here?{" "}
                <button type="button" onClick={() => setTab("register")} className="text-white font-medium hover:underline">Create account</button>
              </p>
            </form>
          )}

          {/* Forgot password */}
          {tab === "forgot" && !forgotSent && (
            <form onSubmit={handleForgot} className="space-y-4">
              <InputGroup label="Email" placeholder="you@example.com" type="email" value={email} onChange={setEmail} required />
              <button type="submit" disabled={loading}
                className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all mt-2 disabled:opacity-50 flex items-center justify-center">
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Send Reset Link"}
              </button>
              <button type="button" onClick={() => setTab("login")} className="w-full text-center text-sm text-white/40 hover:text-white">
                Back to sign in
              </button>
            </form>
          )}

          {tab === "forgot" && forgotSent && (
            <div className="space-y-4 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/10 text-white">
                <Circle size={24} strokeWidth={1.5} className="fill-white" />
              </div>
              <p className="text-white/60 text-sm">Reset link sent to <span className="text-white font-medium">{email}</span></p>
              <button type="button" onClick={() => { setTab("login"); setForgotSent(false); }}
                className="text-sm font-medium text-white hover:underline">Back to sign in</button>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StepItem({ number, text, active }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
      active ? "bg-white text-black border border-white" : "bg-[#1A1A1A] text-white border-none"
    }`}>
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${
        active ? "bg-black text-white" : "bg-white/10 text-white/40"
      }`}>{number}</span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

function SocialButton({ icon: Icon, label }) {
  return (
    <button type="button"
      className="flex items-center justify-center gap-2.5 h-11 w-full bg-black border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-white text-sm font-medium">
      <Icon size={16} strokeWidth={1.75} />
      {label}
    </button>
  );
}

function InputGroup({ label, placeholder, type = "text", value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-1.5">{label}</label>
      <input
        type={type}
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full h-11 bg-[#1A1A1A] border-none rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
      />
    </div>
  );
}
