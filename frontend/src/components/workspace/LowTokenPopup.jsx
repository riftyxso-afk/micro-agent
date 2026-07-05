import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, ArrowRight, AlertTriangle } from "lucide-react";

export const LowTokenPopup = ({ tokenBalance, onDismiss, isGuest }) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("low_token_dismissed") === "1"
  );

  useEffect(() => {
    if (dismissed) return;
    const threshold = isGuest ? 2 : 10;
    if (tokenBalance != null && tokenBalance <= threshold && tokenBalance >= 0) {
      setShow(true);
    }
  }, [tokenBalance, dismissed, isGuest]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    onDismiss?.();
  };

  const handleAction = () => {
    setShow(false);
    navigate(isGuest ? "/auth" : "/topup", { state: isGuest ? { tab: "login" } : undefined });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[360px] overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-[0_20px_60px_rgba(17,24,39,0.2)]"
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-full text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#111111]"
            >
              <X size={14} strokeWidth={2} />
            </button>

            {/* Top accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#F59E0B] via-[#EF4444] to-[#F59E0B]" />

            <div className="px-6 pt-5 pb-6">
              {/* Icon */}
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#FEF2F2]">
                {tokenBalance === 0 ? (
                  <Zap size={24} strokeWidth={1.75} className="text-[#EF4444]" />
                ) : (
                  <AlertTriangle size={24} strokeWidth={1.75} className="text-[#F59E0B]" />
                )}
              </div>

              {/* Title */}
              <h2 className="text-center font-heading text-lg font-semibold text-[#111111]">
                {isGuest && tokenBalance === 0
                  ? "Guest Limit Habis!"
                  : isGuest
                  ? `Sisa ${tokenBalance} Prompt`
                  : tokenBalance === 0
                  ? "Token Habis!"
                  : `Tinggal ${tokenBalance} Token`}
              </h2>

              {/* Description */}
              <p className="mt-2 text-center text-sm leading-relaxed text-[#6B7280]">
                {isGuest && tokenBalance === 0
                  ? "Kamu sudah mencapai batas 10 prompt gratis. Sign in untuk melanjutkan chat tanpa batas."
                  : isGuest
                  ? "Prompt gratis kamu hampir habis. Sign in untuk mendapatkan token gratis dan melanjutkan chat."
                  : tokenBalance === 0
                  ? "Token kamu sudah habis. Top up token untuk melanjutkan chat dengan AI."
                  : tokenBalance <= 2
                  ? "Token hampir habis! Top up sekarang agar bisa terus chat tanpa hambatan."
                  : "Token kamu sudah tipis. Isi ulang sekarang untuk pengalaman chat yang lancar."}
              </p>

              {/* Balance badge */}
              <div className={`mx-auto mt-4 flex w-fit items-center gap-2 rounded-full px-4 py-2 ${
                tokenBalance === 0
                  ? "bg-[#FEF2F2] text-[#EF4444]"
                  : "bg-[#FEF9C3] text-[#854D0E]"
              }`}>
                <Zap size={13} strokeWidth={2} />
                <span className="text-sm font-semibold">{isGuest && tokenBalance === 0 ? "0 prompt tersisa" : isGuest ? `${tokenBalance} prompt tersisa` : `${tokenBalance} token tersisa`}</span>
              </div>

              {/* CTA buttons */}
              <div className="mt-5 space-y-2.5">
                <button
                  onClick={handleAction}
                  className="ma-focus flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] py-3 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(17,24,39,0.18)] transition-all duration-200 hover:bg-[#2D2D2D] active:scale-[0.98]"
                >
                  <Zap size={15} strokeWidth={2} />
                  {isGuest ? "Sign In" : "Top Up Token"}
                  <ArrowRight size={14} strokeWidth={2} />
                </button>
                <button
                  onClick={handleDismiss}
                  className="ma-focus w-full rounded-2xl border border-[#E5E7EB] py-2.5 text-[13px] font-medium text-[#6B7280] transition-colors hover:bg-[#F7F7F8]"
                >
                  Nanti saja
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
