import { useState } from "react";
import { Settings, LogOut, UserRound, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/AuthContext";
import { isSupabaseEnabled } from "@/lib/supabase";

export const UserMenu = ({ size = 40 }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();


  const displayName = user?.email?.split("@")[0] || "Guest";
  const displayEmail = user?.email || "";
  const initial = displayName[0]?.toUpperCase() || "G";

  const handleSignOut = async () => {
    await logout();
    toast("Signed out", { description: "See you next time!" });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-testid="user-avatar"
            aria-label={`Account menu — ${displayName}`}
            style={{ width: size, height: size }}
            className="ma-focus grid place-items-center rounded-full bg-[#22C55E] text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(34,197,94,0.35)] ring-2 ring-white transition-transform duration-150 ease-out hover:scale-[1.05] active:scale-[0.96]"
          >
            {initial}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-56 rounded-2xl border-[#E5E7EB] p-1.5 shadow-[0_10px_30px_rgba(17,24,39,0.08)]"
        >
          <DropdownMenuLabel className="px-2.5 py-2">
            <p className="text-sm font-semibold text-[#111111]">{displayName}</p>
            <p className="mt-0.5 text-xs font-normal text-[#6B7280]">{displayEmail}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#F0F1F3]" />
          <DropdownMenuItem
            data-testid="user-menu-profile"
            onClick={() => navigate("/profile")}
            className="cursor-pointer rounded-xl px-2.5 py-2 text-sm text-[#374151]"
          >
            <UserRound size={16} strokeWidth={1.75} className="text-[#6B7280]" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            data-testid="user-menu-settings"
            onClick={() => navigate("/settings")}
            className="cursor-pointer rounded-xl px-2.5 py-2 text-sm text-[#374151]"
          >
            <Settings size={16} strokeWidth={1.75} className="text-[#6B7280]" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#F0F1F3]" />
          {user ? (
            <DropdownMenuItem
              data-testid="user-menu-signout"
              onClick={handleSignOut}
              className="cursor-pointer rounded-xl px-2.5 py-2 text-sm text-[#374151]"
            >
              <LogOut size={16} strokeWidth={1.75} className="text-[#6B7280]" />
              Sign out
            </DropdownMenuItem>
          ) : isSupabaseEnabled ? (
            <DropdownMenuItem
              data-testid="user-menu-signin"
              onClick={() => navigate("/auth", { state: { tab: "login" } })}
              className="cursor-pointer rounded-xl px-2.5 py-2 text-sm text-[#374151]"
            >
              <LogIn size={16} strokeWidth={1.75} className="text-[#6B7280]" />
              Sign in
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
