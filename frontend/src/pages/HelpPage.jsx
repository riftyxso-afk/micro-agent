import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Book, MessageCircle, Lightbulb, Bug, ExternalLink, ChevronRight } from "lucide-react";

const ITEMS = [
  {
    icon: Book,
    title: "Documentation",
    desc: "Read the full MicroAgent guide and API reference",
    action: "Read docs",
    href: "/docs",
    color: "bg-[#EEF2FF] text-[#6366F1]",
  },
  {
    icon: MessageCircle,
    title: "Contact Support",
    desc: "Reach our team for account or technical issues",
    action: "Open chat",
    href: "mailto:support@microagent.ai",
    color: "bg-[#F0FDF4] text-[#059669]",
  },
  {
    icon: Lightbulb,
    title: "Feature Request",
    desc: "Suggest improvements or new capabilities",
    action: "Submit",
    href: "https://forms.gle/microagent-feedback",
    color: "bg-[#FFFBEB] text-[#D97706]",
  },
  {
    icon: Bug,
    title: "Report a Bug",
    desc: "Something not working as expected? Let us know",
    action: "Report",
    href: "mailto:bugs@microagent.ai",
    color: "bg-[#FEF2F2] text-[#DC2626]",
  },
];

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-[#F7F7F8]">
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)}
            className="ma-focus grid h-9 w-9 place-items-center rounded-xl text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111]">
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <h1 className="text-lg font-semibold text-[#111111]">Help & Support</h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }} className="space-y-3">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            const isExternal = item.href.startsWith("http") || item.href.startsWith("mailto");
            const Wrapper = isExternal ? "a" : "button";
            const wrapperProps = isExternal
              ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
              : { onClick: () => navigate(item.href) };
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}>
                <Wrapper {...wrapperProps}
                  className="flex w-full items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 text-left shadow-[0_1px_3px_rgba(17,24,39,0.04)] transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${item.color}`}>
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111111]">{item.title}</p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">{item.desc}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#6366F1]">
                    {item.action}
                    {isExternal ? <ExternalLink size={12} strokeWidth={1.75} /> : <ChevronRight size={12} strokeWidth={1.75} />}
                  </div>
                </Wrapper>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
          <p className="text-sm font-medium text-[#374151]">Need immediate help?</p>
          <p className="mt-1 text-xs text-[#9CA3AF]">Our team typically responds within 24 hours.</p>
          <a href="mailto:support@microagent.ai"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#111111] px-4 py-2 text-sm font-medium text-white hover:bg-[#2D2D2D] transition-colors">
            <MessageCircle size={14} strokeWidth={1.75} />
            Email Support
          </a>
        </motion.div>
      </div>
    </div>
  );
}
