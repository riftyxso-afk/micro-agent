import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Clock,
  ChevronRight,
  Search,
  Loader2,
  FolderOpen,
  Rocket,
  ShoppingBag,
  Briefcase,
  BarChart2,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { fetchBuilderProjects } from "@/lib/supabase";

// Icon map untuk project berdasarkan nama/type — bisa di-extend
const PROJECT_ICONS = [Rocket, ShoppingBag, Briefcase, BarChart2, BookOpen, CalendarDays];

function projectIcon(index) {
  return PROJECT_ICONS[index % PROJECT_ICONS.length];
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000 && d.getDate() === now.getDate())
    return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diff < 172800000)
    return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function BuilderHistoryDialog({ open, onOpenChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    const fetchProjects = async () => {
      try {
        const data = await fetchBuilderProjects({ userId: user?.id });
        if (!cancelled) setProjects(data);
      } catch (err) {
        console.error("[BuilderHistoryDialog] fetch error:", err);
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProjects();
    return () => { cancelled = true; };
  }, [open, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name?.toLowerCase().includes(q));
  }, [query, projects]);

  const openProject = (project) => {
    onOpenChange(false);
    setQuery("");
    navigate(`/project/${project.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setQuery(""); onOpenChange(v); }}>
      <DialogContent
        data-testid="builder-history-dialog"
        className="left-0 top-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-[#E5E7EB] bg-[#FCFCFD] p-0 sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[75vh] sm:w-full sm:max-w-[540px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#F0F1F3] px-5 pb-4 pt-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F0F4FF] text-[#1F55F1]">
            <Clock size={17} strokeWidth={1.75} />
          </span>
          <div>
            <DialogTitle className="text-base font-semibold text-[#111111]">
              Project History
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-[#6B7280]">
              Your recently edited builder projects
            </DialogDescription>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-[#F0F1F3] px-4 py-2.5">
          <label className="flex items-center gap-2 rounded-xl bg-[#F7F7F8] px-3 py-2">
            <Search size={14} strokeWidth={1.75} className="text-[#9CA3AF] flex-shrink-0" />
            <input
              type="search"
              placeholder="Search projects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[#111111] placeholder-[#9CA3AF] outline-none"
              aria-label="Search project history"
              data-testid="builder-history-search"
            />
          </label>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[#9CA3AF]">
              <Loader2 size={16} strokeWidth={1.75} className="animate-spin" />
              <span className="text-sm">Loading projects...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F3F4F6] text-[#9CA3AF]">
                <FolderOpen size={22} strokeWidth={1.5} />
              </span>
              <p className="text-sm font-medium text-[#374151]">
                {query ? "No projects found" : "No projects yet"}
              </p>
              <p className="text-xs text-[#9CA3AF]">
                {query
                  ? "Try a different search term"
                  : "Start building to see your project history here"}
              </p>
            </div>
          ) : (
            filtered.map((project, i) => {
              const Icon = projectIcon(i);
              return (
                <button
                  key={project.id}
                  type="button"
                  data-testid={`builder-history-item-${project.id}`}
                  onClick={() => openProject(project)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors duration-150 hover:bg-[#F7F7F8] focus:outline-none focus-visible:bg-[#F0F4FF]"
                >
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-[#F3F4F6] text-[#6B7280]">
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-[#111111]">
                      {project.name || "Untitled Project"}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-[#9CA3AF]">
                      <Clock size={10} strokeWidth={1.75} />
                      {formatDate(project.updated_at)}
                    </span>
                  </span>
                  <ChevronRight size={15} strokeWidth={1.75} className="flex-shrink-0 text-[#D1D5DB]" />
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
