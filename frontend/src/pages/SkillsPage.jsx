import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function SkillsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-[#F7F7F8]">
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="ma-focus grid h-9 w-9 place-items-center rounded-xl text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111]">
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <h1 className="text-lg font-semibold text-[#111111]">Skills</h1>
        </div>
      </header>
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#EEF2FF]">
          <FileText size={28} strokeWidth={1.5} className="text-[#6366F1]" />
        </div>
        <h2 className="text-xl font-semibold text-[#111111]">Coming Soon</h2>
        <p className="mt-2 max-w-sm text-sm text-[#6B7280]">
          Skills marketplace sedang dalam pengembangan. Fitur ini akan memungkinkan kamu menginstall, membuat, dan mengelola AI skills.
        </p>
        <button onClick={() => navigate("/home")}
          className="mt-6 rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2D2D2D] transition-colors">
          Kembali ke Home
        </button>
      </div>
    </div>
  );
}
