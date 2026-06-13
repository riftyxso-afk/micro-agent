import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="ma-soft-grid relative min-h-screen overflow-x-hidden bg-[#F6F7F9] font-sans text-neutral-900 antialiased selection:bg-[#EAECE9] selection:text-[#1C2E1E]">
      <LandingNav />

      {/* ===== Hero ===== */}
      <section className="relative z-10 flex min-h-[85vh] flex-col items-center justify-center px-4 pt-24 pb-12 sm:min-h-[90vh] sm:px-6 sm:pt-28 md:min-h-screen md:px-8">
        {/* Background visual layer */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {!videoFailed && (
            <video
              className="h-full w-full object-cover object-right-bottom opacity-25"
              src={VIDEO_SRC}
              autoPlay={!reduceMotion}
              muted
              playsInline
              preload="metadata"
              loop={!reduceMotion}
              onError={() => setVideoFailed(true)}
            />
          )}
          {videoFailed && <div className="ma-hero-glow ma-glow-pulse" />}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(125,211,252,0.16),transparent_34%),radial-gradient(circle_at_70%_24%,rgba(196,181,253,0.14),transparent_38%),linear-gradient(to_bottom,rgba(246,247,249,0.62),rgba(246,247,249,0.92),#F6F7F9)]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          {/* Typewriter headline */}
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            data-testid="hero-headline"
            className="ma-title-gradient mb-4 min-h-[1.8em] select-none whitespace-pre-wrap font-heading text-4xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-5xl sm:mb-6 md:text-6xl lg:text-[92px]"
          >
            {displayed}
            {!done && (
              <span className="animate-blink ml-[4px] inline-block h-[1.05em] w-[3px] translate-y-[0.12em] bg-black" />
            )}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.15 }}
            data-testid="hero-description"
            className="ma-text-balance mx-auto mb-6 max-w-xl text-base font-medium leading-relaxed text-[#5F6670] sm:mb-8 sm:text-lg md:text-xl"
          >
            A calmer command center for switching models, streaming answers,
            comparing output, and keeping every AI workflow in one polished place.
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
