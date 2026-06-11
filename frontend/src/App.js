import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import HomeWorkspace from "@/pages/HomeWorkspace";
import ChatInterface from "@/pages/ChatInterface";

function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomeWorkspace />} />
          <Route path="/chat" element={<ChatInterface />} />
        </Routes>
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
  );
}

export default App;
