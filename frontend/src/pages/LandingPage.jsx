import { useState } from "react";
import { motion } from "framer-motion";
import { useTypewriter } from "@/hooks/useTypewriter";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingComposer } from "@/components/landing/LandingComposer";
import {
  FeaturesSection,
  RoomsSection,
  CreditsSection,
  CompareSection,
  UploadSection,
  FinalCTASection,
  LandingFooter,
} from "@/components/landing/LandingSections";

const HEADLINE = "All AI.\nOne workspace.";
const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4";

export default function LandingPage() {
  const { displayed, done } = useTypewriter(HEADLINE, 38, 600);
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white font-sans text-neutral-900 antialiased selection:bg-[#EAECE9] selection:text-[#1C2E1E]">
      <LandingNav />

      {/* ===== Hero ===== */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-16 pt-28">
        {/* Background visual layer */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {!videoFailed && (
            <video
              className="h-full w-full object-cover object-right-bottom opacity-25"
              src={VIDEO_SRC}
              autoPlay
              muted
              playsInline
              preload="auto"
              loop
              onError={() => setVideoFailed(true)}
            />
          )}
          {videoFailed && <div className="ma-hero-glow ma-glow-pulse" />}
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/90 to-white" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          {/* Typewriter headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            data-testid="hero-headline"
            className="mb-6 min-h-[2.1em] select-none whitespace-pre-wrap text-5xl font-normal leading-[1.02] tracking-tight text-black md:text-7xl lg:text-[88px]"
          >
            {displayed}
            {!done && (
              <span className="animate-blink ml-[4px] inline-block h-[1.05em] w-[3px] translate-y-[0.12em] bg-black" />
            )}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.15 }}
            data-testid="hero-description"
            className="mx-auto mb-10 max-w-3xl text-lg font-normal leading-relaxed text-[#5A635A] md:text-xl"
          >
            Chat with multiple AI models, auto-select the best model, compare
            answers, upload files, and work inside AI Rooms — all from one
            simple workspace.
          </motion.p>

          {/* Prompt composer + chips */}
          <LandingComposer />
        </div>
      </section>

      {/* ===== Content sections ===== */}
      <FeaturesSection />
      <RoomsSection />
      <CreditsSection />
      <CompareSection />
      <UploadSection />
      <FinalCTASection />
      <LandingFooter />
    </div>
  );
}
