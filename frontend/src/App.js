import "@/App.css";
import { useState, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import HomeWorkspace from "@/pages/HomeWorkspace";
import ChatInterface from "@/pages/ChatInterface";
import SettingsPage from "@/pages/SettingsPage";
import PricingPage from "@/pages/PricingPage";
import ProfilePage from "@/pages/ProfilePage";
import IntroducingOpusPage from "@/pages/IntroducingOpusPage";
import IntroducingCLIPage from "@/pages/IntroducingCLIPage";
import SkillsPage from "@/pages/SkillsPage";
import PaymentPage from "@/pages/PaymentPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import EmailVerificationPage from "@/pages/EmailVerificationPage";
import HelpPage from "@/pages/HelpPage";
import ImageGalleryPage from "@/pages/ImageGalleryPage";
import TopUpPage from "@/pages/TopUpPage";
import TopUpSuccessPage from "@/pages/TopUpSuccessPage";
import BuilderPage from "@/pages/BuilderPage";
import ProjectWorkspacePage from "@/pages/ProjectWorkspacePage";
import OnboardingPage from "@/pages/OnboardingPage";
import { AuthProvider } from "@/lib/AuthContext";
import { AuthModal } from "@/components/workspace/AuthModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppContent } from "@/components/AppContent";
import { StorageWarning } from "@/components/StorageWarning";

// Global auth modal state
const AuthModalContext = createContext(null);
export const useAuthModal = () => useContext(AuthModalContext);

function App() {
  const [authModal, setAuthModal] = useState({ open: false, tab: "login" });
  const openAuth = (tab = "login") => setAuthModal({ open: true, tab });
  const closeAuth = () => setAuthModal({ open: false, tab: "login" });

  return (
    <ErrorBoundary>
    <StorageWarning />
    <AuthProvider>
    <AuthModalContext.Provider value={{ openAuth, closeAuth }}>
    <AppContent>
    <TooltipProvider delayDuration={200}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeWorkspace />} />
          <Route path="/home" element={<HomeWorkspace />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/chat/:sessionId" element={<ChatInterface />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/introducing-opus" element={<IntroducingOpusPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/cli" element={<IntroducingCLIPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/verify" element={<EmailVerificationPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/gallery" element={<ImageGalleryPage />} />
          <Route path="/topup" element={<TopUpPage />} />
          <Route path="/topup/success" element={<TopUpSuccessPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/project/:id" element={<ProjectWorkspacePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/auth" element={<Navigate to="/home" replace />} />
        </Routes>
        <AuthModal open={authModal.open} onClose={closeAuth} defaultTab={authModal.tab} />
      </BrowserRouter>
      <Toaster
        position="top-center"
        theme="light"
        toastOptions={{
          style: {
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 10px 30px rgba(17,24,39,0.08)",
          },
        }}
      />
    </TooltipProvider>
    </AppContent>
    </AuthModalContext.Provider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
