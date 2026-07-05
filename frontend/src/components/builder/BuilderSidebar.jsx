import { useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Clock,
  LayoutGrid,
  Star,
  Users,
  Inbox,
  Layers,
  Settings,
  User,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "@/components/workspace/Logo";

const TOP_NAV = [
  { id: "home",      label: "Home",      icon: Home,       path: "/builder" },
  { id: "search",    label: "Search",    icon: Search,     path: null },
  { id: "history",   label: "History",   icon: Clock,      path: null },
  { id: "templates", label: "Templates", icon: Layers,     path: null },
  { id: "apps",      label: "Apps",      icon: LayoutGrid, path: null },
  { id: "favorites", label: "Favorites", icon: Star,       path: null },
];

const BOTTOM_NAV = [
  { id: "team",     label: "Team",     icon: Users,    path: null },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

const SidebarBtn = ({ id, label, icon: Icon, active, onClick }) => (
  <Tooltip delayDuration={100}>
    <TooltipTrigger asChild>
      <button
        type="button"
        aria-label={label}
        aria-current={active ? "page" : undefined}
        data-testid={`builder-nav-${id}`}
        onClick={onClick}
        className={`builder-sidebar-item${active ? " active" : ""}`}
      >
        <Icon size={18} strokeWidth={1.75} />
      </button>
    </TooltipTrigger>
    <TooltipContent side="right" className="text-xs">
      {label}
    </TooltipContent>
  </Tooltip>
);

export function BuilderSidebar({ activeNav = "home", onNavChange }) {
  const navigate = useNavigate();

  const handleNav = (id, path) => {
    onNavChange?.(id);
    if (path) navigate(path);
  };

  return (
    <aside className="builder-sidebar" aria-label="Builder navigation">
      {/* Logo — always navigates home */}
      <div className="mb-3">
        <button
          type="button"
          aria-label="Go to home"
          onClick={() => handleNav("home", "/builder")}
          className="rounded-xl transition-transform hover:scale-[1.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F55F1]"
        >
          <Logo size={36} />
        </button>
      </div>

      {/* Profile avatar */}
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Your profile"
            data-testid="builder-nav-profile"
            onClick={() => handleNav("profile", "/profile")}
            className={`builder-sidebar-item mb-1${activeNav === "profile" ? " active" : ""}`}
          >
            <User size={18} strokeWidth={1.75} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">Profile</TooltipContent>
      </Tooltip>

      {/* Divider */}
      <div className="builder-sidebar-divider" />

      {/* Top nav */}
      <nav className="flex flex-1 flex-col items-center gap-1 pt-1" aria-label="Main navigation">
        {TOP_NAV.map((item) => (
          <SidebarBtn
            key={item.id}
            {...item}
            active={activeNav === item.id}
            onClick={() => handleNav(item.id, item.path)}
          />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col items-center gap-1 mt-auto pt-2">
        <div className="builder-sidebar-divider" />

        {BOTTOM_NAV.map((item) => (
          <SidebarBtn
            key={item.id}
            {...item}
            active={activeNav === item.id}
            onClick={() => handleNav(item.id, item.path)}
          />
        ))}

        {/* Inbox with notification dot */}
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Inbox"
              data-testid="builder-nav-inbox"
              onClick={() => handleNav("inbox", null)}
              className={`builder-sidebar-item relative${activeNav === "inbox" ? " active" : ""}`}
            >
              <Inbox size={18} strokeWidth={1.75} />
              <span className="builder-notification-dot" aria-label="New notifications" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">Inbox</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}
