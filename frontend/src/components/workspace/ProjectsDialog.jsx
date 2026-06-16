import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FolderClosed,
  ArrowRight,
  Search,
  PenLine,
  Code2,
  GraduationCap,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PROJECTS = [
  {
    id: "research-hub",
    name: "Research Hub",
    description: "Market notes, source summaries, and comparison prompts.",
    chipId: "research",
    icon: Search,
    accent: "bg-[#EFF6FF] text-[#2563EB]",
  },
  {
    id: "content-studio",
    name: "Content Studio",
    description: "Threads, launch copy, docs, and brand drafts.",
    chipId: "create",
    icon: PenLine,
    accent: "bg-[#F5F3FF] text-[#7C3AED]",
  },
  {
    id: "code-lab",
    name: "Code Lab",
    description: "UI snippets, debugging notes, and component ideas.",
    chipId: "create",
    icon: Code2,
    accent: "bg-[#ECFDF5] text-[#059669]",
  },
  {
    id: "study-room",
    name: "Study Room",
    description: "Explainers, flashcards, and step-by-step problem solving.",
    chipId: "solve",
    icon: GraduationCap,
    accent: "bg-[#FFFBEB] text-[#D97706]",
  },
];

export const ProjectsDialog = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  const openProject = (project) => {
    onOpenChange(false);
    navigate(`/home?chipId=${project.chipId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="projects-dialog"
        className="left-0 top-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-[#E5E7EB] bg-[#FCFCFD] p-0 sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[75vh] sm:w-full sm:max-w-[620px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#F0F1F3] px-5 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F7F7F8] text-[#111111]">
              <FolderClosed size={17} strokeWidth={1.75} />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold text-[#111111]">
                Projects
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-[#6B7280]">
                Organize chats by workflow
              </DialogDescription>
            </div>
          </div>
          <button
            type="button"
            data-testid="new-project-button"
            onClick={() => openProject({ chipId: "create" })}
            className="ma-focus hidden h-9 items-center gap-1.5 rounded-xl bg-[#111111] px-3 text-xs font-medium text-white transition-[background-color,transform] duration-150 ease-out hover:bg-[#2D2D2D] active:scale-[0.98] sm:inline-flex"
          >
            <Plus size={14} strokeWidth={2} />
            New
          </button>
        </div>

        {/* Grid */}
        <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto p-4 sm:grid-cols-2">
          {PROJECTS.map((project) => {
            const Icon = project.icon;
            return (
              <button
                key={project.id}
                type="button"
                data-testid={`project-card-${project.id}`}
                onClick={() => openProject(project)}
                className="ma-focus group flex min-h-[160px] flex-col rounded-3xl border border-[#E5E7EB] bg-white p-5 text-left shadow-sm transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-1 hover:border-[#D1D5DB] hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-2xl ${project.accent}`}>
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className="rounded-full bg-[#F7F7F8] px-2 py-1 text-xs font-medium text-[#6B7280]">
                    {project.chipId}
                  </span>
                </div>
                <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-[#111111]">
                  {project.name}
                </h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-[#6B7280]">
                  {project.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#111111]">
                  Open project
                  <ArrowRight size={13} strokeWidth={2} className="transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
