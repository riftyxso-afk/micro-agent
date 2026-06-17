import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/useSubscription";
import { supabase, isSupabaseEnabled, fetchSessions, fetchMessages } from "@/lib/supabase";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Mail,
  Calendar,
  Link as LinkIcon,
  MapPin,
  Edit3,
  Check,
  X,
  Zap,
  Crown,
  Activity,
  MessageSquare,
  Clock,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/workspace/Sidebar";
import { MobileNav } from "@/components/workspace/MobileNav";
import { UserMenu } from "@/components/workspace/UserMenu";
import { HistoryDialog } from "@/components/workspace/HistoryDialog";
import { ProjectsDialog } from "@/components/workspace/ProjectsDialog";
import { MoreDialog } from "@/components/workspace/MoreDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const STATS = [
  { icon: MessageSquare, label: "Conversations", value: "—" },
  { icon: Zap, label: "Credits used", value: "—" },
  { icon: Clock, label: "Hours saved", value: "—" },
  { icon: Award, label: "Streak", value: "—" },
];

const ACTIVITY = [];

const SectionCard = ({ children }) => (
  <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
    {children}
  </div>
);

export default function ProfilePage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const { plan, isPro, isUltra, subscription, loading: subLoading } = useSubscription();
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({ conversations: null });
  const [recentSessions, setRecentSessions] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user || !isSupabaseEnabled) { setStatsLoading(false); return; }
    fetchSessions().then(sessions => {
      setRecentSessions(sessions.slice(0, 5));
      setStats({ conversations: sessions.length });
    }).catch(() => {}).finally(() => setStatsLoading(false));
  }, [user]);
  const [activeDialog, setActiveDialog] = useState(null);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
  });
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    if (!user) return;
    const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "";
    const initial = { name, email: user.email || "", bio: user.user_metadata?.bio || "", location: user.user_metadata?.location || "", website: user.user_metadata?.website || "" };
    setProfile(initial);
    setDraft(initial);
  }, [user]);

  const handleNavChange = (navId) => {
    if (navId === "new") navigate("/home");
    else if (navId === "history" || navId === "projects" || navId === "more") setActiveDialog(navId);
    else navigate("/home");
  };

  const startEditing = () => {
    setDraft(profile);
    setEditing(true);
  };

  const saveProfile = () => {
    setProfile(draft);
    setEditing(false);
    toast("Profile updated", { description: "Your changes have been saved." });
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98], delay },
        };

  return (
    <div className="ma-page relative min-h-dvh">
      <Sidebar
        activeNav="more"
        onNavChange={handleNavChange}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onLogoClick={() => navigate("/home")}
      />

      <header className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
        <UserMenu />
      </header>

      <main
        className={`relative min-h-dvh px-4 pb-20 pt-10 transition-[margin] duration-300 ease-out sm:px-6 md:pb-10 ${
          collapsed ? "md:ml-[68px]" : "md:ml-[86px]"
        }`}
      >
        <div className="mx-auto w-full max-w-[720px]">
          <motion.div {...fadeUp(0)}>
            <button
              type="button"
              data-testid="profile-back-button"
              onClick={() => navigate(-1)}
              className="ma-focus mb-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[#6B7280] transition-colors duration-150 hover:bg-white hover:text-[#111111]"
            >
              <ArrowLeft size={15} strokeWidth={1.75} />
              Back
            </button>
          </motion.div>

          <motion.div {...fadeUp(0.05)}>
            <SectionCard>
              <div className="relative overflow-hidden rounded-t-2xl h-28 bg-[linear-gradient(135deg,#7DD3FC_0%,#A5B4FC_48%,#C4B5FD_100%)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.24),transparent_50%)]" />
              </div>

              <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
                <div className="-mt-10 flex items-end gap-4">
                  <div className="relative">
                    <div
                      data-testid="profile-avatar"
                      className="grid h-20 w-20 place-items-center rounded-full bg-[#22C55E] text-2xl font-semibold text-white shadow-[0_2px_8px_rgba(34,197,94,0.35)] ring-4 ring-white"
                    >
                      {profile.name[0]?.toUpperCase()}
                    </div>
                    <button
                      type="button"
                      data-testid="profile-avatar-edit"
                      onClick={() => toast("Upload avatar", { description: "JPG, PNG under 2MB. Coming soon." })}
                      className="ma-focus absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] shadow-[0_1px_3px_rgba(17,24,39,0.1)] transition-colors duration-150 hover:bg-[#F7F7F8] hover:text-[#111111]"
                    >
                      <Camera size={13} strokeWidth={1.75} />
                    </button>
                  </div>

                  <div className="flex-1 pb-1">
                    {editing ? (
                      <Input
                        data-testid="profile-name-input"
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        className="text-lg font-semibold text-[#111111]"
                      />
                    ) : (
                      <h1
                        data-testid="profile-name"
                        className="font-heading text-lg font-semibold tracking-tight text-[#111111] sm:text-xl"
                      >
                        {profile.name}
                      </h1>
                    )}
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#6B7280]">
                      <Mail size={12} strokeWidth={1.75} />
                      {profile.email}
                    </span>
                  </div>

                  {!editing ? (
                    <Button
                      data-testid="profile-edit-button"
                      variant="outline"
                      size="sm"
                      onClick={startEditing}
                      className="h-8 shrink-0 rounded-full border-[#E5E7EB] text-xs"
                    >
                      <Edit3 size={13} strokeWidth={1.75} />
                      Edit profile
                    </Button>
                  ) : (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        data-testid="profile-cancel-button"
                        onClick={cancelEdit}
                        className="ma-focus grid h-8 w-8 place-items-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition-colors duration-150 hover:bg-[#F7F7F8]"
                      >
                        <X size={14} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        data-testid="profile-save-button"
                        onClick={saveProfile}
                        className="ma-focus grid h-8 w-8 place-items-center rounded-full bg-[#111111] text-white transition-colors duration-150 hover:bg-[#2D2D2D]"
                      >
                        <Check size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-2.5 text-sm">
                  {editing ? (
                    <>
                      <Input
                        data-testid="profile-bio-input"
                        value={draft.bio}
                        onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                        placeholder="Bio"
                        className="rounded-xl border-[#E5E7EB]"
                      />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-3">
                          <MapPin size={14} strokeWidth={1.75} className="shrink-0 text-[#6B7280]" />
                          <Input
                            data-testid="profile-location-input"
                            value={draft.location}
                            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                            placeholder="Location"
                            className="border-0 px-0 shadow-none focus-visible:ring-0"
                          />
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-3">
                          <LinkIcon size={14} strokeWidth={1.75} className="shrink-0 text-[#6B7280]" />
                          <Input
                            data-testid="profile-website-input"
                            value={draft.website}
                            onChange={(e) => setDraft({ ...draft, website: e.target.value })}
                            placeholder="Website"
                            className="border-0 px-0 shadow-none focus-visible:ring-0"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[#374151]">{profile.bio}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7280]">
                        {profile.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} strokeWidth={1.75} />
                            {profile.location}
                          </span>
                        )}
                        {profile.website && (
                          <span className="flex items-center gap-1">
                            <LinkIcon size={13} strokeWidth={1.75} />
                            {profile.website}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={13} strokeWidth={1.75} />
                          Joined June 2026
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </SectionCard>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="mt-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold text-[#111111]">Plan</h2>
              <Button
                data-testid="profile-manage-plan"
                variant="outline"
                size="sm"
                onClick={() => navigate("/pricing")}
                className="h-7 rounded-full border-[#E5E7EB] text-xs"
              >
                Manage plan
              </Button>
            </div>
            <SectionCard>
              <div className="flex items-center justify-between p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`grid h-8 w-8 place-items-center rounded-xl ${
                      isUltra ? "bg-[#F5F3FF]" : isPro ? "bg-[#EEF2FF]" : "bg-[#FEF3C7]"
                    }`}>
                      <Crown size={15} strokeWidth={1.75} className={isUltra ? "text-[#7C3AED]" : isPro ? "text-[#6366F1]" : "text-[#B45309]"} />
                    </span>
                    <span className="text-sm font-semibold text-[#111111]">
                      {subLoading ? "Loading..." : isUltra ? "Ultra" : isPro ? "Pro" : "Free Plan"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#6B7280]">
                    {subLoading ? "" : `${subscription?.credits ?? 50} credits / bulan`}
                    {isPro && " · Aktif"}
                  </p>
                </div>
                <div className="w-32 text-right">
                  {!isPro && (
                    <button onClick={() => navigate("/pricing")}
                      className="rounded-full bg-[#111111] px-3 py-1 text-xs font-medium text-white hover:bg-[#2D2D2D]">
                      Upgrade
                    </button>
                  )}
                  {isPro && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Aktif
                    </span>
                  )}
                </div>
              </div>
            </SectionCard>
          </motion.div>

          <motion.div {...fadeUp(0.15)} className="mt-5">
            <h2 className="font-heading text-base font-semibold text-[#111111]">Stats</h2>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SectionCard>
                <div className="p-4">
                  <MessageSquare size={16} strokeWidth={1.75} className="text-[#6B7280]" />
                  <p className="mt-2 font-heading text-xl font-semibold text-[#111111]">
                    {statsLoading ? <span className="inline-block h-5 w-8 rounded-md bg-[#F3F4F6] animate-pulse" /> : (stats.conversations ?? "—")}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">Conversations</p>
                </div>
              </SectionCard>
              <SectionCard>
                <div className="p-4">
                  <Zap size={16} strokeWidth={1.75} className="text-[#6B7280]" />
                  <p className="mt-2 font-heading text-xl font-semibold text-[#111111]">
                    {subLoading ? <span className="inline-block h-5 w-8 rounded-md bg-[#F3F4F6] animate-pulse" /> : (subscription?.credits ?? "—")}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">Credits left</p>
                </div>
              </SectionCard>
              <SectionCard>
                <div className="p-4">
                  <Clock size={16} strokeWidth={1.75} className="text-[#6B7280]" />
                  <p className="mt-2 font-heading text-xl font-semibold text-[#111111]">—</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">Hours saved</p>
                </div>
              </SectionCard>
              <SectionCard>
                <div className="p-4">
                  <Award size={16} strokeWidth={1.75} className="text-[#6B7280]" />
                  <p className="mt-2 font-heading text-xl font-semibold text-[#111111]">—</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">Streak</p>
                </div>
              </SectionCard>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="mt-5">
            <h2 className="font-heading text-base font-semibold text-[#111111]">Recent activity</h2>
            <SectionCard>
              <div className="p-2">
                {statsLoading ? (
                  <div className="space-y-2 p-2">
                    {[1,2,3].map(i => <div key={i} className="h-10 rounded-xl bg-[#F3F4F6] animate-pulse" />)}
                  </div>
                ) : recentSessions.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <Activity size={18} strokeWidth={1.75} className="text-[#D1D5DB]" />
                    <p className="text-sm text-[#9CA3AF]">No recent activity</p>
                    {!user && <p className="text-xs text-[#9CA3AF]">Sign in to see your activity</p>}
                  </div>
                ) : (
                  <div className="divide-y divide-[#F3F4F6]">
                    {recentSessions.map((s, i) => {
                      const date = new Date(s.updated_at);
                      const now = new Date();
                      const diff = now - date;
                      const label = diff < 86400000 ? `Today, ${date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}` :
                        diff < 172800000 ? 'Yesterday' : date.toLocaleDateString([], {month:'short', day:'numeric'});
                      return (
                        <button key={s.id} onClick={() => navigate("/chat", { state: { sessionId: s.id } })}
                          className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-[#F7F7F8] transition-colors">
                          <MessageSquare size={14} strokeWidth={1.75} className="shrink-0 text-[#6B7280]" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-[#374151]">{s.title || "Untitled"}</p>
                            <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{label}</p>
                          </div>
                          <ChevronRight size={13} strokeWidth={1.75} className="shrink-0 text-[#D1D5DB]" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </SectionCard>
          </motion.div>
        </div>
      </main>

      <MobileNav activeNav="more" onNavChange={handleNavChange} />

      <HistoryDialog
        open={activeDialog === "history"}
        onOpenChange={(open) => setActiveDialog(open ? "history" : null)}
      />
      <ProjectsDialog
        open={activeDialog === "projects"}
        onOpenChange={(open) => setActiveDialog(open ? "projects" : null)}
      />
      <MoreDialog
        open={activeDialog === "more"}
        onOpenChange={(open) => setActiveDialog(open ? "more" : null)}
      />
    </div>
  );
}
