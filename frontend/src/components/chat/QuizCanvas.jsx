import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart3,
  FileText,
  Award,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/chatApi";

function OptionButton({ label, index, selected, correct, revealed, onSelect }) {
  let border = "border-[#E5E7EB] hover:border-[#6366F1] hover:bg-[#EEF2FF]";
  let bg = "bg-white hover:bg-[#FAFAFF]";
  let textColor = "text-[#111111]";
  let icon = null;
  let disabled = false;

  if (revealed) {
    disabled = true;
    if (index === correct) {
      border = "border-green-400 bg-green-50";
      textColor = "text-green-800";
      icon = <CheckCircle2 size={16} className="shrink-0 text-green-500" />;
    } else if (selected && index !== correct) {
      border = "border-red-300 bg-red-50";
      textColor = "text-red-700";
      icon = <XCircle size={16} className="shrink-0 text-red-400" />;
    } else {
      bg = "bg-gray-50";
      textColor = "text-[#9CA3AF]";
    }
  } else if (selected) {
    border = "border-[#6366F1] bg-[#EEF2FF]";
    textColor = "text-[#6366F1]";
  }

  return (
    <button
      onClick={() => !disabled && onSelect(index)}
      disabled={disabled}
      className={`ma-focus flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[13px] font-medium transition-all ${border} ${bg}`}
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
        selected && !revealed
          ? "border-[#6366F1] bg-[#6366F1] text-white"
          : revealed && index === correct
          ? "border-green-500 bg-green-500 text-white"
          : revealed && selected && index !== correct
          ? "border-red-400 bg-red-400 text-white"
          : "border-[#D1D5DB] text-[#6B7280]"
      }`}>
        {String.fromCharCode(65 + index)}
      </span>
      <span className={`flex-1 ${textColor}`}>{label}</span>
      {icon}
    </button>
  );
}

export function QuizCanvas({ quizData, userId, authToken }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [historyAttempts, setHistoryAttempts] = useState([]);

  const questions = quizData?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIdx];
  const selectedAnswer = answers[currentIdx];

  useEffect(() => {
    if (quizData?.quiz_id && userId) {
      fetch(`${API_BASE_URL}/api/quiz/${quizData.quiz_id}/attempts`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
        .then((r) => r.json())
        .then((data) => setHistoryAttempts(data.attempts || []))
        .catch(() => {});
    }
  }, [quizData?.quiz_id, userId, authToken]);

  const handleSelect = useCallback((index) => {
    if (revealed) return;
    setAnswers((prev) => ({ ...prev, [currentIdx]: index }));
  }, [currentIdx, revealed]);

  const handleReveal = useCallback(() => {
    if (selectedAnswer === undefined) return;
    setRevealed(true);
  }, [selectedAnswer]);

  const handleNext = useCallback(() => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((i) => i + 1);
      setRevealed(false);
    }
  }, [currentIdx, totalQuestions]);

  const handlePrev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setRevealed(false);
    }
  }, [currentIdx]);

  const handleSubmit = useCallback(async () => {
    if (!quizData?.quiz_id) return;
    setIsSubmitting(true);
    const answerList = questions.map((_, i) => answers[i] ?? -1);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          quiz_id: quizData.quiz_id,
          answers: answerList,
          user_id: userId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitResult(data);
        setShowResults(true);
        setHistoryAttempts((prev) => [
          {
            id: data.attempt_id || "local",
            score: data.score,
            total_questions: data.total_questions,
            completed_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Quiz submit failed:", err);
    }
    setIsSubmitting(false);
  }, [quizData, answers, questions, userId, authToken]);

  const handleReset = useCallback(() => {
    setCurrentIdx(0);
    setAnswers({});
    setRevealed(false);
    setShowResults(false);
    setSubmitResult(null);
  }, []);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  if (!quizData || !totalQuestions) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="space-y-2">
          <FileText size={32} className="mx-auto text-[#D1D5DB]" />
          <p className="text-sm text-[#6B7280]">Quiz tidak tersedia</p>
        </div>
      </div>
    );
  }

  if (showResults && submitResult) {
    const percentage = Math.round((submitResult.score / submitResult.total_questions) * 100);
    let gradeColor = "text-red-500";
    let gradeLabel = "Perlu Belajar Lagi";
    if (percentage >= 80) { gradeColor = "text-green-600"; gradeLabel = "Sangat Baik!"; }
    else if (percentage >= 60) { gradeColor = "text-yellow-600"; gradeLabel = "Cukup Baik"; }
    else if (percentage >= 40) { gradeColor = "text-orange-500"; gradeLabel = "Masih Perlu Belajar"; }

    return (
      <div className="flex h-full flex-col overflow-auto">
        <div className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg space-y-6"
          >
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF]">
                <Award size={28} className="text-[#6366F1]" />
              </div>
              <h2 className="text-lg font-semibold text-[#111111]">{quizData.title || "Quiz Selesai!"}</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Hasil pengerjaan quiz</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center shadow-sm">
              <p className={`text-5xl font-bold ${gradeColor}`}>
                {submitResult.score}/{submitResult.total_questions}
              </p>
              <p className={`mt-2 text-sm font-medium ${gradeColor}`}>{gradeLabel}</p>
              <div className="mx-auto mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-[#F3F4F6]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    percentage >= 80 ? "bg-green-500" : percentage >= 60 ? "bg-yellow-500" : "bg-red-400"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Review Jawaban</p>
              {questions.map((q, i) => {
                const userAns = answers[i];
                const correct = q.correct_answer_index;
                const isCorrect = userAns === correct;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    {isCorrect
                      ? <CheckCircle2 size={16} className="shrink-0 text-green-500" />
                      : <XCircle size={16} className="shrink-0 text-red-400" />
                    }
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-[#111111]">Soal {i + 1}</p>
                      <p className="truncate text-[11px] text-[#6B7280]">{q.question}</p>
                    </div>
                    <button
                      onClick={() => { setCurrentIdx(i); setRevealed(true); setShowResults(false); }}
                      className="shrink-0 text-[11px] font-medium text-[#6366F1] hover:underline"
                    >
                      Lihat
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="ma-focus flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-[13px] font-medium text-[#6B7280] transition-colors hover:bg-[#F7F7F8]"
              >
                <RotateCcw size={14} strokeWidth={1.75} />
                Ulangi Quiz
              </button>
            </div>

            {historyAttempts.length > 1 && (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={14} className="text-[#6B7280]" />
                  <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Riwayat Skor</span>
                </div>
                <div className="space-y-1.5">
                  {historyAttempts.map((a, i) => (
                    <div key={a.id || i} className="flex items-center justify-between text-[12px]">
                      <span className="text-[#6B7280]">Percobaan #{historyAttempts.length - i}</span>
                      <span className="font-medium text-[#111111]">{a.score}/{a.total_questions}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-5">
        <div className="mx-auto max-w-2xl">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[#111111]">{quizData.title || "Quiz"}</h2>
            {quizData.source_file_name && (
              <p className="mt-0.5 text-[11px] text-[#6B7280]">
                Berdasarkan: {quizData.source_file_name}
              </p>
            )}
          </div>

          <div className="mb-4 flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#6B7280]">
              Soal {currentIdx + 1} dari {totalQuestions}
            </span>
            <span className="text-[12px] text-[#6B7280]">
              {answeredCount} dari {totalQuestions} terjawab
            </span>
          </div>

          <div className="mb-4 flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, i) => {
              const isActive = i === currentIdx;
              const isAnswered = answers[i] !== undefined;
              return (
                <button
                  key={i}
                  onClick={() => { setCurrentIdx(i); setRevealed(false); }}
                  className={`ma-focus h-2 flex-1 rounded-full transition-all ${
                    isActive ? "bg-[#6366F1]" : isAnswered ? "bg-[#A5B4FC]" : "bg-[#E5E7EB]"
                  }`}
                  aria-label={`Soal ${i + 1}`}
                />
              );
            })}
          </div>

          {currentQuestion && (
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[12px] font-bold text-[#6366F1]">
                  {currentIdx + 1}
                </span>
                <p className="pt-0.5 text-[14px] font-medium leading-snug text-[#111111]">
                  {currentQuestion.question}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {currentQuestion.options.map((opt, oi) => (
                  <OptionButton
                    key={oi}
                    label={opt}
                    index={oi}
                    selected={selectedAnswer === oi}
                    correct={currentQuestion.correct_answer_index}
                    revealed={revealed}
                    onSelect={handleSelect}
                  />
                ))}
              </div>

              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3"
                >
                  <div className="flex items-start gap-2">
                    <HelpCircle size={14} className="mt-0.5 shrink-0 text-[#6366F1]" />
                    <p className="text-[12px] leading-relaxed text-[#374151]">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="border-t border-[#F0F1F3] bg-white px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="ma-focus flex items-center gap-1 rounded-xl border border-[#E5E7EB] px-3 py-2 text-[12px] font-medium text-[#6B7280] transition-colors hover:bg-[#F7F7F8] disabled:opacity-40"
          >
            <ChevronLeft size={14} strokeWidth={1.75} />
            Sebelumnya
          </button>

          <div className="flex gap-2">
            {!revealed && selectedAnswer !== undefined && (
              <button
                onClick={handleReveal}
                className="ma-focus rounded-xl bg-[#6366F1] px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#4F46E5]"
              >
                Cek Jawaban
              </button>
            )}

            {revealed && currentIdx < totalQuestions - 1 && (
              <button
                onClick={handleNext}
                className="ma-focus flex items-center gap-1 rounded-xl bg-[#6366F1] px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#4F46E5]"
              >
                Selanjutnya
                <ChevronRight size={14} strokeWidth={1.75} />
              </button>
            )}

            {revealed && currentIdx === totalQuestions - 1 && (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                className="ma-focus flex items-center gap-1.5 rounded-xl bg-green-600 px-5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Award size={14} strokeWidth={1.75} />
                )}
                {isSubmitting ? "Menyimpan..." : "Lihat Hasil"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
