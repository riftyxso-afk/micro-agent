import { Zap } from "lucide-react";
import { UserMenu } from "@/components/workspace/UserMenu";
import { Logo } from "@/components/workspace/Logo";

export const ChatTopBar = ({ title, room, credits }) => {
  return (
    <header
      data-testid="chat-topbar"
      className="sticky top-0 z-30 shrink-0 border-b border-[#E5E7EB] bg-[#F7F7F8]/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 w-full max-w-[1100px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="md:hidden">
            <Logo size={28} />
          </span>
          <h1
            data-testid="chat-title"
            className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#111111]"
          >
            {title}
          </h1>
          <span
            data-testid="room-badge"
            className="ma-fade-in hidden shrink-0 items-center rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[11px] font-medium text-[#6B7280] shadow-[0_1px_2px_rgba(17,24,39,0.04)] sm:inline-flex"
            key={room}
          >
            {room}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <span
            data-testid="credit-balance"
            className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#111111] shadow-[0_1px_2px_rgba(17,24,39,0.04)]"
            title="Credit balance"
          >
            <Zap
              size={12}
              strokeWidth={2.25}
              className="fill-[#F59E0B] text-[#F59E0B]"
            />
            {credits.toLocaleString()}
          </span>
          <UserMenu size={34} />
        </div>
      </div>
      {/* Mobile room badge row */}
      <div className="mx-auto block w-full max-w-[1100px] px-4 pb-2 sm:hidden">
        <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#6B7280]">
          {room}
        </span>
      </div>
    </header>
  );
};
