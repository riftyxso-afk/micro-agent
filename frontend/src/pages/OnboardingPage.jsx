import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, SkipForward } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { API_BASE_URL } from "@/lib/chatApi";

const STEPS = [
  {
    id: "role",
    question: "Apa peran kamu saat ini?",
    options: [
      { value: "pelajar", label: "Pelajar / Mahasiswa" },
      { value: "karyawan", label: "Karyawan" },
      { value: "freelancer", label: "Freelancer" },
      { value: "founder", label: "Founder / Pebisnis" },
      { value: "developer", label: "Developer" },
      { value: "lainnya", label: "Lainnya" },
    ],
  },
  {
    id: "primary_goal",
    question: "Tujuan utama kamu pakai Micro Agent?",
    options: [
      { value: "belajar", label: "Bantu belajar / tugas" },
      { value: "coding", label: "Coding" },
      { value: "konten", label: "Nulis konten" },
      { value: "riset", label: "Riset" },
      { value: "bisnis", label: "Bisnis / UMKM" },
      { value: "lainnya", label: "Lainnya" },
    ],
  },
  {
    id: "ai_familiarity",
    question: "Seberapa familiar kamu dengan AI / chatbot?",
    options: [
      { value: "baru", label: "Baru mulai" },
      { value: "cukup", label: "Cukup sering pakai" },
      { value: "power", label: "Power user" },
    ],
  },
  {
    id: "language_preference",
    question: "Bahasa yang nyaman buat kamu?",
    options: [
      { value: "id_santai", label: "Bahasa Indonesia santai" },
      { value: "id_formal", label: "Bahasa Indonesia formal" },
      { value: "en", label: "English" },
    ],
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { session, setIsOnboarded } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleSelect = async (value) => {
    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);

    if (isLast) {
      await submit(newAnswers, false);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = async () => {
    await submit(answers, true);
  };

  const submit = async (data, skipped) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
        },
        body: JSON.stringify({ ...data, skipped }),
      });
    } catch {}
    setIsOnboarded(true);
    navigate("/home", { replace: true });
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F7F7F8] px-4">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">
            {step + 1} dari {STEPS.length}
          </p>
          <h1 className="mt-3 font-heading text-2xl font-semibold text-[#111111]">
            {current.question}
          </h1>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {current.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => !loading && handleSelect(opt.value)}
              disabled={loading}
              className="flex w-full items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 text-left text-sm font-medium text-[#111111] transition-colors hover:border-[#6366F1] hover:bg-[#F5F3FF] disabled:opacity-50"
            >
              {opt.label}
              <ChevronRight size={16} strokeWidth={1.75} className="text-[#D1D5DB]" />
            </button>
          ))}
        </div>

        {/* Skip */}
        <div className="mt-6 text-center">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="flex items-center gap-1.5 mx-auto text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors disabled:opacity-50"
          >
            <SkipForward size={12} />
            Lewati
          </button>
        </div>
      </motion.div>
    </div>
  );
}
