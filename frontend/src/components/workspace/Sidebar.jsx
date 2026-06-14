import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
      className={`ma-focus group relative flex w-full flex-col items-center gap-1 rounded-2xl px-2 transition-colors duration-150 ease-out ${
        collapsed ? "py-2.5" : "py-2.5"
      } ${
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

export const Sidebar = ({ activeNav, onNavChange, collapsed, onToggleCollapse, onLogoClick }) => {
  return (
    <aside
      data-testid="sidebar"
      className={`fixed left-0 top-0 z-40 hidden h-dvh flex-col items-center border-r border-[#E5E7EB] bg-[#F7F7F8]/80 backdrop-blur-sm transition-[width] duration-300 ease-out md:flex ${
        collapsed ? "w-[68px]" : "w-[86px]"
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
  );
};
