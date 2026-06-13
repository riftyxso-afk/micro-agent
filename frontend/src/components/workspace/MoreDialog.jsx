import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Ellipsis,
  Settings,
  HelpCircle,
  Megaphone,
  Shield,
} from "lucide-react";

const MORE_ITEMS = [
  {
    id: "settings",
    label: "Settings",
    description: "Preferences, API keys, and account",
    icon: Settings,
    accent: "bg-[#F7F7F8] text-[#111111]",
  },
  {
    id: "help",
    label: "Help & Feedback",
    description: "Guides, support, and feature requests",
    icon: HelpCircle,
    accent: "bg-[#EFF6FF] text-[#2563EB]",
  },
  {
    id: "changelog",
    label: "Changelog",
    description: "What's new in MicroAgent",
    icon: Megaphone,
    accent: "bg-[#F5F3FF] text-[#7C3AED]",
  },
  {
    id: "privacy",
    label: "Privacy & Terms",
    description: "Data handling and terms of service",
    icon: Shield,
    accent: "bg-[#ECFDF5] text-[#059669]",
  },
];

export const MoreDialog = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="more-dialog"
        className="left-0 top-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-[#E5E7EB] bg-[#FCFCFD] p-0 sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[75vh] sm:w-full sm:max-w-[540px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#F0F1F3] px-5 pb-4 pt-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F7F7F8] text-[#111111]">
            <Ellipsis size={17} strokeWidth={1.75} />
          </span>
          <div>
            <DialogTitle className="text-base font-semibold text-[#111111]">
              More
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-[#6B7280]">
              Settings, help, and information
            </DialogDescription>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {MORE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`more-item-${item.id}`}
                onClick={() => {
                  // Placeholder — future routing
                  onOpenChange(false);
                }}
                className="ma-focus flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition-colors duration-150 ease-out hover:bg-[#F7F7F8] active:scale-[0.99]"
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.accent}`}>
                  <Icon size={17} strokeWidth={1.75} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium text-[#111111]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 text-xs text-[#6B7280]">
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
