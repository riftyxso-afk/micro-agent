import { NAV_ITEMS } from "@/lib/workspaceData";

export const MobileNav = ({ activeNav, onNavChange }) => {
  return (
    <nav
      data-testid="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#E5E7EB] bg-white/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = activeNav === item.id;
        return (
          <button
            key={item.id}
            type="button"
            data-testid={`mobile-nav-${item.id}`}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            onClick={() => onNavChange(item.id)}
            className={`ma-focus flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-150 ease-out ${
              active ? "text-[#111111]" : "text-[#6B7280]"
            }`}
          >
            <span
              className={`grid h-8 w-12 place-items-center rounded-full transition-colors duration-150 ease-out ${
                active ? "bg-[#F0F1F3]" : "bg-transparent"
              }`}
            >
              <Icon size={19} strokeWidth={1.75} />
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};
