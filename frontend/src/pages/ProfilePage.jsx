import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  { icon: MessageSquare, label: "Conversations", value: "148" },
  { icon: Zap, label: "Credits used", value: "5,230" },
  { icon: Clock, label: "Hours saved", value: "42.5h" },
  { icon: Award, label: "Streak", value: "12 days" },
];

const ACTIVITY = [
  { label: "Used GPT 5.5 Ultra", date: "2 hours ago", credits: 30 },
  { label: "Web search: AI agents trends", date: "Yesterday", credits: 5 },
  { label: "Switched to Pro plan", date: "1 week ago", credits: null },
  { label: "Created project: Landing Page", date: "2 weeks ago", credits: null },
];

const SectionCard = ({ children }) => (
  <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
    {children}
  </div>
);

export default function ProfilePage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [activeDialog, setActiveDialog] = useState(null);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Riftyxso",
    email: "riftyxso@microagent.ai",
    bio: "Building with AI. Exploring the edge of what's possible.",
    location: "Jakarta, Indonesia",
    website: "microagent.ai",
  });
  const [draft, setDraft] = useState(profile);

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
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#FEF3C7]">
                      <Crown size={15} strokeWidth={1.75} className="text-[#B45309]" />
                    </span>
                    <span className="text-sm font-semibold text-[#111111]">Free Plan</span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#6B7280]">
                    50 credits remaining · Resets in 18 days
                  </p>
                </div>
                <div className="w-32">
                  <div className="h-1.5 w-full rounded-full bg-[#F0F1F3]">
                    <div
                      className="h-1.5 rounded-full bg-[linear-gradient(90deg,#F59E0B,#F97316)]"
                      style={{ width: "10%" }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          </motion.div>

          <motion.div {...fadeUp(0.15)} className="mt-5">
            <h2 className="font-heading text-base font-semibold text-[#111111]">Stats</h2>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <SectionCard key={stat.label}>
                    <div className="p-4">
                      <Icon size={16} strokeWidth={1.75} className="text-[#6B7280]" />
                      <p className="mt-2 font-heading text-xl font-semibold text-[#111111]">{stat.value}</p>
                      <p className="mt-0.5 text-xs text-[#6B7280]">{stat.label}</p>
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="mt-5">
            <h2 className="font-heading text-base font-semibold text-[#111111]">Recent activity</h2>
            <SectionCard>
              <div className="p-2">
                {ACTIVITY.map((item, i) => (
                  <div key={i}>
                    {i > 0 && <Separator className="bg-[#F0F1F3]" />}
                    <div className="flex items-center justify-between px-3 py-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Activity size={14} strokeWidth={1.75} className="shrink-0 text-[#6B7280]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-[#374151]">{item.label}</p>
                          <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{item.date}</p>
                        </div>
                      </div>
                      {item.credits !== null && (
                        <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-[#F7F7F8] px-2 py-0.5 text-[11px] font-semibold text-[#6B7280]">
                          <Zap size={10} strokeWidth={2.25} className="text-[#F59E0B]" />
                          {item.credits}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
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
