import { Settings, LogOut, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserMenu = ({ size = 40 }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="user-avatar"
          aria-label="Account menu — Riftyxso"
          style={{ width: size, height: size }}
          className="ma-focus grid place-items-center rounded-full bg-[#22C55E] text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(34,197,94,0.35)] ring-2 ring-white transition-transform duration-150 ease-out hover:scale-[1.05] active:scale-[0.96]"
        >
          R
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-56 rounded-2xl border-[#E5E7EB] p-1.5 shadow-[0_10px_30px_rgba(17,24,39,0.08)]"
      >
        <DropdownMenuLabel className="px-2.5 py-2">
          <p className="text-sm font-semibold text-[#111111]">Riftyxso</p>
          <p className="mt-0.5 text-xs font-normal text-[#6B7280]">
            riftyxso@microagent.ai
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#F0F1F3]" />
        <DropdownMenuItem
          data-testid="user-menu-profile"
          className="cursor-pointer rounded-xl px-2.5 py-2 text-sm text-[#374151]"
        >
          <UserRound size={16} strokeWidth={1.75} className="text-[#6B7280]" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          data-testid="user-menu-settings"
          className="cursor-pointer rounded-xl px-2.5 py-2 text-sm text-[#374151]"
        >
          <Settings size={16} strokeWidth={1.75} className="text-[#6B7280]" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#F0F1F3]" />
        <DropdownMenuItem
          data-testid="user-menu-signout"
          className="cursor-pointer rounded-xl px-2.5 py-2 text-sm text-[#374151]"
        >
          <LogOut size={16} strokeWidth={1.75} className="text-[#6B7280]" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
