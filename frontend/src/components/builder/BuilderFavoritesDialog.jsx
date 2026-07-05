import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Star,
  ChevronRight,
  Search,
  Loader2,
  StarOff,
  Rocket,
  ShoppingBag,
  Briefcase,
  BarChart2,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { fetchBuilderFavorites } from "@/lib/supabase";

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

export function BuilderFavoritesDialog({ open, onOpenChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    const fetchFavorites = async () => {
      try {
        const data = await fetchBuilderFavorites({ userId: user?.id });
        if (!cancelled) setFavorites(data);
      } catch (err) {
        console.error("[BuilderFavoritesDialog] fetch error:", err);
        if (!cancelled) setFavorites([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFavorites();
    return () => { cancelled = true; };
  }, [open, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return favorites;
    return favorites.filter((p) => p.name?.toLowerCase().includes(q));
  }, [query, favorites]);

  const openProject = (project) => {
    onOpenChange(false);
    setQuery("");
    navigate(`/project/${project.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setQuery(""); onOpenChange(v); }}>
      <DialogContent
        data-testid="builder-favorites-dialog"
        className="left-0 top-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-[#E5E7EB] bg-[#FCFCFD] p-0 sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[75vh] sm:w-full sm:max-w-[540px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#F0F1F3] px-5 pb-4 pt-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FFFBEB] text-[#D97706]">
            <Star size={17} strokeWidth={1.75} />
          </span>
          <div>
            <DialogTitle className="text-base font-semibold text-[#111111]">
              Favorites
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-[#6B7280]">
              Your starred builder projects
            </DialogDescription>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-[#F0F1F3] px-4 py-2.5">
          <label className="flex items-center gap-2 rounded-xl bg-[#F7F7F8] px-3 py-2">
            <Search size={14} strokeWidth={1.75} className="text-[#9CA3AF] flex-shrink-0" />
            <input
              type="search"
              placeholder="Search favorites..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[#111111] placeholder-[#9CA3AF] outline-none"
              aria-label="Search favorites"
              data-testid="builder-favorites-search"
            />
          </label>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[#9CA3AF]">
              <Loader2 size={16} strokeWidth={1.75} className="animate-spin" />
              <span className="text-sm">Loading favorites...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FFFBEB] text-[#D97706]">
                <StarOff size={22} strokeWidth={1.5} />
              </span>
              <p className="text-sm font-medium text-[#374151]">
                {query ? "No favorites found" : "No favorites yet"}
              </p>
              <p className="text-xs text-[#9CA3AF]">
                {query
                  ? "Try a different search term"
                  : "Star a project to add it to your favorites"}
              </p>
            </div>
          ) : (
            filtered.map((project, i) => {
              const Icon = projectIcon(i);
              return (
                <button
                  key={project.id}
                  type="button"
                  data-testid={`builder-favorites-item-${project.id}`}
                  onClick={() => openProject(project)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors duration-150 hover:bg-[#F7F7F8] focus:outline-none focus-visible:bg-[#FFFBEB]"
                >
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-[#F3F4F6] text-[#6B7280]">
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-[#111111]">
                      {project.name || "Untitled Project"}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-[#9CA3AF]">
                      <Star size={10} strokeWidth={1.75} className="text-[#D97706]" />
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
