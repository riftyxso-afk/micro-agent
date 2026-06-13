import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/workspace/Logo";

const NAV_LINKS = [
  { id: "product", label: "Product", href: "#features" },
  { id: "models", label: "Models", href: "#credits" },
  { id: "rooms", label: "Rooms", href: "#rooms" },
  { id: "pricing", label: "Pricing", href: "#credits" },
  { id: "docs", label: "Docs", href: "#footer" },
];

export const LandingNav = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const goHome = () => {
    setIsMobileMenuOpen(false);
    navigate("/home");
  };

  return (
    <>
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed inset-x-0 top-0 z-50 flex flex-row items-center justify-between border-b border-black/5 bg-white/72 px-4 py-2.5 backdrop-blur-2xl sm:px-6 sm:py-3"
      >
        {/* Logo */}
        <a
          href="/"
          data-testid="landing-logo"
          className="ma-focus flex items-center gap-2.5 rounded-xl"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Logo size={26} />
          <span className="select-none text-[18px] font-semibold tracking-tight text-black sm:text-[20px]">
            MicroAgent
          </span>
        </a>

        {/* Desktop links */}
        <nav className="hidden items-center gap-7 text-[15px] text-black md:flex lg:gap-9 lg:text-[16px]">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              data-testid={`nav-link-${link.id}`}
              className="ma-focus rounded-lg transition-opacity hover:opacity-60"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2.5 md:flex">
          <button
            type="button"
            data-testid="nav-login-button"
            onClick={goHome}
            className="ma-focus rounded-full px-4 py-2 text-[15px] font-medium text-black transition-opacity hover:opacity-60"
          >
            Login
          </button>
          <button
            type="button"
            data-testid="nav-start-button"
            onClick={goHome}
            className="ma-focus rounded-full bg-black px-5 py-2.5 text-[15px] font-medium text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-[background-color,box-shadow,transform] duration-200 ease-out hover:bg-neutral-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.22)] active:scale-[0.98]"
          >
            Start for free
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          data-testid="mobile-menu-button"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((o) => !o)}
          className="ma-focus relative z-[51] grid h-10 w-10 place-items-center rounded-xl md:hidden"
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 top-0 block h-[1.8px] w-5 rounded-full bg-black transition-[top,opacity,transform] duration-300 ease-out ${
                isMobileMenuOpen ? "top-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] block h-[1.8px] w-5 rounded-full bg-black transition-[background-color,box-shadow,transform] duration-200 ease-out ${
                isMobileMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] block h-[1.8px] w-5 rounded-full bg-black transition-[top,opacity,transform] duration-300 ease-out ${
                isMobileMenuOpen ? "top-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </motion.header>

      {/* Mobile overlay */}
      <div
        data-testid="mobile-menu-overlay"
        className={`fixed inset-0 z-[49] flex flex-col bg-white/95 backdrop-blur-sm transition-[top,opacity,transform] duration-300 ease-out md:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-7 px-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              data-testid={`mobile-nav-link-${link.id}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="ma-focus rounded-lg px-3 py-2 text-[26px] font-medium tracking-tight text-black transition-opacity hover:opacity-60"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 flex w-full max-w-[280px] flex-col gap-3">
            <button
              type="button"
              data-testid="mobile-login-button"
              onClick={goHome}
              className="ma-focus h-12 rounded-full border border-neutral-200 bg-white text-[16px] font-medium text-black transition-colors hover:bg-neutral-50"
            >
              Login
            </button>
            <button
              type="button"
              data-testid="mobile-start-button"
              onClick={goHome}
              className="ma-focus h-12 rounded-full bg-black text-[16px] font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Start for free
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
