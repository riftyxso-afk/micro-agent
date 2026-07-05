import { PanelLeftClose, PanelLeftOpen, X, Menu } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "@/components/workspace/Logo";
import { NAV_ITEMS } from "@/lib/workspaceData";

const SidebarItem = ({ item, active, collapsed, onClick }) => {
  const Icon = item.icon;

  const button = (
    <button
      type="button"
      data-testid={`sidebar-${item.id}-button`}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`ma-focus group relative flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2.5 transition-colors duration-150 ease-out ${
        active
          ? "bg-white text-[#111111] shadow-[0_1px_2px_rgba(17,24,39,0.06)]"
          : "text-[#6B7280] hover:bg-white/70 hover:text-[#111111]"
      }`}
    >
      <Icon
        size={20}
        strokeWidth={1.75}
        className="transition-transform duration-150 ease-out group-hover:scale-[1.06]"
      />
      {!collapsed && (
        <span className="text-[11px] font-medium leading-none tracking-[-0.01em]">
          {item.label}
        </span>
      )}
      {active && (
        <span
          aria-hidden="true"
          className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full ma-accent-bar"
        />
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }
  return button;
};

// Mobile nav item for the drawer
const MobileNavItem = ({ item, active, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      type="button"
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`ma-focus flex w-full items-center gap-3 rounded-2xl px-4 py-3 transition-colors duration-150 ease-out ${
        active
          ? "bg-white text-[#111111] shadow-[0_1px_2px_rgba(17,24,39,0.06)]"
          : "text-[#6B7280] hover:bg-white/70 hover:text-[#111111]"
      }`}
    >
      <Icon size={20} strokeWidth={1.75} />
      <span className="text-[15px] font-medium">{item.label}</span>
    </button>
  );
};

export const Sidebar = ({ activeNav, onNavChange, collapsed, onToggleCollapse, onLogoClick }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileNav = (id) => {
    setMobileOpen(false);
    onNavChange(id);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        data-testid="sidebar"
        className={`fixed left-0 top-0 z-40 hidden h-dvh flex-col items-center border-r border-[#E5E7EB] bg-[#F7F7F8]/80 backdrop-blur-sm transition-[width] duration-300 ease-out md:flex ${
          collapsed ? "w-[56px]" : "w-[86px]"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-center">
          <button
            type="button"
            data-testid="sidebar-logo"
            aria-label="MicroAgent home"
            onClick={onLogoClick}
            className="ma-focus rounded-xl transition-transform duration-150 ease-out hover:scale-[1.05] active:scale-[0.97]"
          >
            <Logo size={36} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex w-full flex-1 flex-col items-stretch gap-1.5 px-3 pt-2">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              active={activeNav === item.id}
              collapsed={collapsed}
              onClick={() => onNavChange(item.id)}
            />
          ))}
        </nav>

        {/* Collapse button */}
        <div className="w-full px-3 pb-5">
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-testid="sidebar-collapse-button"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={onToggleCollapse}
                className="ma-focus flex w-full items-center justify-center rounded-2xl py-2.5 text-[#6B7280] transition-colors duration-150 ease-out hover:bg-white/70 hover:text-[#111111]"
              >
                {collapsed ? (
                  <PanelLeftOpen size={19} strokeWidth={1.75} />
                ) : (
                  <PanelLeftClose size={19} strokeWidth={1.75} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {collapsed ? "Expand" : "Collapse"}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* Mobile hamburger button */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
        className="ma-focus fixed left-4 top-4 z-40 grid h-9 w-9 place-items-center rounded-xl border border-[#E5E7EB] bg-white/85 text-[#6B7280] backdrop-blur-sm shadow-[0_1px_3px_rgba(17,24,39,0.08)] transition-colors hover:text-[#111111] md:hidden"
      >
        <Menu size={18} strokeWidth={1.75} />
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        </div>
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed left-0 top-0 z-50 h-dvh w-[260px] flex-col border-r border-[#E5E7EB] bg-[#F7F7F8] transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } flex`}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between px-4">
          <button
            type="button"
            aria-label="MicroAgent home"
            onClick={() => { setMobileOpen(false); onLogoClick(); }}
            className="ma-focus rounded-xl transition-transform hover:scale-[1.05]"
          >
            <Logo size={32} />
          </button>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="ma-focus grid h-8 w-8 place-items-center rounded-xl text-[#6B7280] hover:bg-white/70 hover:text-[#111111]"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pt-2">
          {NAV_ITEMS.filter((item) => item.id !== "new").map((item) => (
            <MobileNavItem
              key={item.id}
              item={item}
              active={activeNav === item.id}
              onClick={() => handleMobileNav(item.id)}
            />
          ))}
        </nav>
      </div>
    </>
  );
};
