import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Settings,
  HelpCircle,
  Megaphone,
  Shield,
  Globe,
  Moon,
  Sun,
  Send,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  BookOpen,
  Lightbulb,
  Check,
  ArrowLeft,
  Sparkles,
  Bug,
  Zap,
  Layout,
  Code,
  Palette,
  FileText,
  Lock,
  Database,
  Cookie,
  Scale,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/workspace/Sidebar";
import { MobileNav } from "@/components/workspace/MobileNav";
import { UserMenu } from "@/components/workspace/UserMenu";
import { HistoryDialog } from "@/components/workspace/HistoryDialog";
import { ProjectsDialog } from "@/components/workspace/ProjectsDialog";
import { MoreDialog } from "@/components/workspace/MoreDialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const SETTINGS_TABS = [
  { id: "preferences", label: "Preferences", desc: "Customize your experience", icon: Settings },
  { id: "help", label: "Help & Feedback", desc: "Guides, support, and requests", icon: HelpCircle },
  { id: "changelog", label: "Changelog", desc: "What's new in MicroAgent", icon: Megaphone },
  { id: "privacy", label: "Privacy & Terms", desc: "Data handling and policies", icon: Shield },
];



const CHANGELOG_ENTRIES = [
  {
    version: "0.5.0",
    date: "June 15, 2026",
    tag: "Latest",
    tagColor: "bg-blue-50 text-blue-600",
    items: [
      { type: "feat", icon: Sparkles, text: "Reasoning toggle — matikan/nyalakan tampilan proses berpikir AI" },
      { type: "feat", icon: Sparkles, text: "Code block syntax highlighting dengan 13 bahasa, tema dark" },
      { type: "feat", icon: Sparkles, text: "Vague prompt detection — klarifikasi otomatis dengan 4 opsi" },
      { type: "feat", icon: Sparkles, text: "Sources collapsible pipeline — sumber web rapi di akhir respons" },
      { type: "improve", icon: Zap, text: "Copy & Download button di setiap code block" },
      { type: "improve", icon: Zap, text: "Toolbar composer: Attach, Reasoning, Image, Web Search" },
    ],
  },
  {
    version: "0.4.1",
    date: "June 10, 2026",
    items: [
      { type: "feat", icon: Sparkles, text: "Download respons AI sebagai file .md" },
      { type: "feat", icon: Sparkles, text: "Web search maksimal 10 hasil dengan sitasi natural" },
      { type: "feat", icon: Sparkles, text: "Real reasoning streaming dari provider (bukan fake)" },
      { type: "improve", icon: Zap, text: "Integrasi AIMurah provider (mengganti NVIDIA)" },
      { type: "fix", icon: Bug, text: "Bug watermark Emergent & PostHog dihapus" },
    ],
  },
  {
    version: "0.4.0",
    date: "June 4, 2026",
    items: [
      { type: "feat", icon: Sparkles, text: "Landing page dengan hero prompt composer & typewriter" },
      { type: "feat", icon: Sparkles, text: "Route restruktur: /, /home, /chat" },
      { type: "fix", icon: Bug, text: "Credit decrement hanya sekali per pesan" },
      { type: "improve", icon: Zap, text: "Animasi Framer Motion dengan reduced-motion respect" },
    ],
  },
  {
    version: "0.3.0",
    date: "May 20, 2026",
    items: [
      { type: "feat", icon: Sparkles, text: "Chat Interface penuh: streaming, thinking block, stop generation" },
      { type: "feat", icon: Sparkles, text: "Model picker dengan search, kategori, & peringatan expensive" },
      { type: "feat", icon: Sparkles, text: "Quick action chips dengan room mode switching" },
      { type: "improve", icon: Zap, text: "Mobile bottom navigation" },
    ],
  },
  {
    version: "0.2.0",
    date: "May 5, 2026",
    items: [
      { type: "feat", icon: Sparkles, text: "Home workspace: prompt composer, model selector, Auto Mode" },
      { type: "feat", icon: Sparkles, text: "Sidebar collapsible dengan tooltip & active states" },
      { type: "feat", icon: Sparkles, text: "FastAPI backend dengan SSE streaming" },
    ],
  },
  {
    version: "0.1.0",
    date: "April 10, 2026",
    tag: "Initial",
    tagColor: "bg-gray-100 text-gray-500",
    items: [
      { type: "feat", icon: Sparkles, text: "Project scaffolding: React, Tailwind, shadcn/ui, Framer Motion" },
      { type: "feat", icon: Sparkles, text: "Design token system & CSS variables" },
      { type: "feat", icon: Sparkles, text: "MongoDB persistence backend" },
    ],
  },
];

const PRIVACY_SECTIONS = [
  {
    icon: Database,
    title: "Data Storage",
    content: "Your conversations are stored locally by default. When MongoDB is configured, chat history syncs to your database. We never access or store your prompts on external servers beyond what the chosen AI model provider requires to generate responses.",
  },
  {
    icon: Lock,
    title: "API Keys",
    content: "All API keys you enter are used only to communicate with the respective services. Keys are passed directly from your browser to the provider and are never logged, cached, or shared.",
  },
  {
    icon: Cookie,
    title: "Cookies & Tracking",
    content: "MicroAgent does not use tracking cookies, analytics scripts, or third-party trackers. Your session state stays in your browser.",
  },
  {
    icon: Globe,
    title: "Web Search",
    content: "When you enable web search, your prompt text is sent to Firecrawl or Tavily to retrieve relevant sources. You can disable web search at any time from the prompt composer toolbar.",
  },
  {
    icon: Scale,
    title: "Terms of Service",
    content: "MicroAgent is provided as-is for personal and commercial use. AI-generated responses may contain inaccuracies — always verify important information. You are responsible for complying with the terms of any AI model provider whose API key you configure.",
  },
];

const SectionCard = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(17,24,39,0.04)] ${className}`}>
    {children}
  </div>
);

const SettingRow = ({ label, desc, children, last = false }) => (
  <>
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-[#111111]">{label}</span>
        {desc && <span className="text-xs text-[#6B7280]">{desc}</span>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
    {!last && <Separator className="bg-[#F0F1F3]" />}
  </>
);

const PreferencesSection = ({ reduceMotion }) => {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [defaultModel, setDefaultModel] = useState("claude-sonnet-4-5");
  const [sendWithEnter, setSendWithEnter] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <motion.div
      {...(reduceMotion ? {} : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] },
      })}
      className="space-y-5"
    >
      <div>
        <h3 className="font-heading text-lg font-semibold text-[#111111]">Appearance</h3>
        <p className="mt-0.5 text-sm text-[#6B7280]">Customize how MicroAgent looks and feels.</p>
      </div>

      <SectionCard>
        <SettingRow
          label="Theme"
          desc="Choose your preferred color scheme"
        >
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger
              data-testid="settings-theme-select"
              className="w-[160px] rounded-xl border-[#E5E7EB] bg-white text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="light">
                <span className="flex items-center gap-2">
                  <Sun size={14} strokeWidth={1.75} /> Light
                </span>
              </SelectItem>
              <SelectItem value="dark">
                <span className="flex items-center gap-2">
                  <Moon size={14} strokeWidth={1.75} /> Dark
                </span>
              </SelectItem>
              <SelectItem value="auto">
                <span className="flex items-center gap-2">
                  <Globe size={14} strokeWidth={1.75} /> System
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow
          label="Compact mode"
          desc="Reduce spacing for a tighter layout"
        >
          <Switch
            data-testid="settings-compact-switch"
            checked={compactMode}
            onCheckedChange={setCompactMode}
          />
        </SettingRow>
        <SettingRow
          label="Default model"
          desc="Model used when starting a new chat"
        >
          <Select value={defaultModel} onValueChange={setDefaultModel}>
            <SelectTrigger
              data-testid="settings-model-select"
              className="w-[180px] rounded-xl border-[#E5E7EB] bg-white text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="claude-sonnet-4-5">Claude Sonnet 4.5</SelectItem>
              <SelectItem value="claude-sonnet-4-5-1m">Claude Sonnet 4.5 (1M)</SelectItem>
              <SelectItem value="deepseek-v4-flash">DeepSeek v4 Flash</SelectItem>
              <SelectItem value="deepseek-v3">DeepSeek V3</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="o4-mini">o4 Mini</SelectItem>
              <SelectItem value="auto">Auto Select</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow
          label="Send with Enter"
          desc="Press Enter to send, Shift+Enter for newline"
          last
        >
          <Switch
            data-testid="settings-enter-switch"
            checked={sendWithEnter}
            onCheckedChange={setSendWithEnter}
          />
        </SettingRow>
      </SectionCard>

      <div className="pt-2">
        <h3 className="font-heading text-lg font-semibold text-[#111111]">Language</h3>
        <p className="mt-0.5 text-sm text-[#6B7280]">Set your preferred language for the interface.</p>
      </div>

      <SectionCard>
        <SettingRow label="Interface language" desc="Language for UI text and labels" last>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger
              data-testid="settings-language-select"
              className="w-[160px] rounded-xl border-[#E5E7EB] bg-white text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="id">Bahasa Indonesia</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SectionCard>
    </motion.div>
  );
};

const HelpSection = ({ reduceMotion }) => {
  const HELP_ITEMS = [
    {
      icon: BookOpen,
      title: "Documentation",
      desc: "Read the full MicroAgent guide and API reference",
      action: "Read docs",
      testId: "help-docs-link",
      accent: "bg-blue-50 text-blue-600",
    },
    {
      icon: MessageCircle,
      title: "Contact Support",
      desc: "Reach our team for account or technical issues",
      action: "Open chat",
      testId: "help-support-link",
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: Lightbulb,
      title: "Feature Request",
      desc: "Suggest improvements or new capabilities",
      action: "Submit",
      testId: "help-feature-link",
      accent: "bg-violet-50 text-violet-600",
    },
    {
      icon: Bug,
      title: "Report a Bug",
      desc: "Something not working as expected? Let us know",
      action: "Report",
      testId: "help-bug-link",
      accent: "bg-amber-50 text-amber-600",
    },
  ];

  const FAQS = [
    { q: "How does the credit system work?", a: "Each AI model response costs a set number of credits. Your balance is displayed in the top bar during chat." },
    { q: "What is Auto Mode?", a: "Auto Mode lets MicroAgent pick the best model for each prompt based on complexity and context." },
    { q: "Can I use my own API keys?", a: "Yes. Navigate to Preferences > API Keys to configure your own OpenAI, Firecrawl, or Tavily keys." },
    { q: "Does MicroAgent store my conversations?", a: "Conversations are stored locally. If MongoDB is configured, they also sync to your database. We never store data on external servers." },
  ];

  return (
    <motion.div
      {...(reduceMotion ? {} : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] },
      })}
      className="space-y-5"
    >
      <div>
        <h3 className="font-heading text-lg font-semibold text-[#111111]">Get Help</h3>
        <p className="mt-0.5 text-sm text-[#6B7280]">Find answers, report issues, or suggest improvements.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {HELP_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              data-testid={item.testId}
              onClick={() => toast(`${item.title}`, { description: item.desc })}
              className="ma-focus group flex flex-col items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left shadow-[0_1px_3px_rgba(17,24,39,0.04)] transition-all duration-150 hover:border-[#d6dcf5] hover:shadow-[0_4px_16px_rgba(17,24,39,0.06)]"
            >
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${item.accent}`}>
                <Icon size={17} strokeWidth={1.75} />
              </span>
              <div>
                <span className="text-sm font-medium text-[#111111]">{item.title}</span>
                <p className="mt-0.5 text-xs text-[#6B7280]">{item.desc}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-[#6B7280] transition-colors duration-150 group-hover:text-[#111111]">
                {item.action} <ChevronRight size={12} strokeWidth={1.75} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <h3 className="font-heading text-lg font-semibold text-[#111111]">Frequently Asked Questions</h3>
      </div>

      <SectionCard>
        {FAQS.map((faq, i) => (
          <div key={i}>
            {i > 0 && <Separator className="bg-[#F0F1F3]" />}
            <div className="px-5 py-4">
              <p className="text-sm font-medium text-[#111111]">{faq.q}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">{faq.a}</p>
            </div>
          </div>
        ))}
      </SectionCard>
    </motion.div>
  );
};

const ChangelogSection = ({ reduceMotion }) => {
  const typeColors = {
    feat: "text-blue-600",
    fix: "text-rose-500",
    improve: "text-emerald-600",
  };

  return (
    <motion.div
      {...(reduceMotion ? {} : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] },
      })}
      className="space-y-5"
    >
      <div>
        <h3 className="font-heading text-lg font-semibold text-[#111111]">Changelog</h3>
        <p className="mt-0.5 text-sm text-[#6B7280]">Track every update and improvement to MicroAgent.</p>
      </div>

      <div className="relative space-y-0">
        {CHANGELOG_ENTRIES.map((entry, idx) => (
          <div key={entry.version} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 ${idx === 0 ? "border-blue-400 bg-blue-50" : "border-[#E5E7EB] bg-white"}`} />
              {idx < CHANGELOG_ENTRIES.length - 1 && (
                <div className="w-px flex-1 bg-[#E5E7EB]" />
              )}
            </div>

            <div className="flex-1 pb-8">
              <SectionCard>
                <div className="flex flex-wrap items-center gap-2 px-5 pt-4 pb-2">
                  <span className="text-sm font-semibold text-[#111111]">v{entry.version}</span>
                  {entry.tag && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${entry.tagColor}`}>
                      {entry.tag}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <Clock size={12} strokeWidth={1.75} />
                    {entry.date}
                  </span>
                </div>
                <div className="px-5 pb-4">
                  {entry.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-1.5">
                      <item.icon size={14} strokeWidth={1.75} className={`mt-0.5 shrink-0 ${typeColors[item.type] || "text-[#6B7280]"}`} />
                      <span className="text-sm text-[#374151]">{item.text}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const PrivacySection = ({ reduceMotion }) => (
  <motion.div
    {...(reduceMotion ? {} : {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] },
    })}
    className="space-y-5"
  >
    <div>
      <h3 className="font-heading text-lg font-semibold text-[#111111]">Privacy & Terms</h3>
      <p className="mt-0.5 text-sm text-[#6B7280]">How MicroAgent handles your data and your rights.</p>
    </div>

    <div className="space-y-3">
      {PRIVACY_SECTIONS.map((section) => {
        const Icon = section.icon;
        return (
          <SectionCard key={section.title}>
            <div className="px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F0FDF4]">
                  <Icon size={15} strokeWidth={1.75} className="text-emerald-600" />
                </span>
                <span className="text-sm font-medium text-[#111111]">{section.title}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">{section.content}</p>
            </div>
          </SectionCard>
        );
      })}
    </div>

    <SectionCard>
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-sm font-medium text-[#111111]">Need the full legal document?</span>
          <p className="mt-0.5 text-xs text-[#6B7280]">Contact us for detailed terms and data processing agreements.</p>
        </div>
        <Button
          data-testid="privacy-contact-button"
          variant="outline"
          size="sm"
          className="w-full rounded-xl border-[#E5E7EB] bg-white text-xs font-medium text-[#111111] hover:bg-[#F7F7F8] sm:w-auto"
        >
          Contact Legal
        </Button>
      </div>
    </SectionCard>
  </motion.div>
);

const TAB_COMPONENTS = {
  preferences: PreferencesSection,
  help: HelpSection,
  changelog: ChangelogSection,
  privacy: PrivacySection,
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav] = useState("more");
  const [activeDialog, setActiveDialog] = useState(null);

  const VALID_TABS = ["preferences", "help", "changelog", "privacy"];
  const initialTab = VALID_TABS.includes(searchParams.get("section"))
    ? searchParams.get("section")
    : "preferences";
  const [activeTab, setActiveTab] = useState(initialTab);

  const ActiveSection = TAB_COMPONENTS[activeTab] || PreferencesSection;

  const handleNavChange = (navId) => {
    if (navId === "new") {
      navigate("/home");
    } else if (navId === "history" || navId === "projects") {
      setActiveDialog(navId);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="ma-page relative min-h-dvh">
      <Sidebar
        activeNav={activeNav}
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
        <div className="mx-auto w-full max-w-[960px]">
          <motion.div
            {...(reduceMotion ? {} : {
              initial: { opacity: 0, y: 12 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
            })}
          >
            <button
              type="button"
              data-testid="settings-back-button"
              onClick={() => navigate(-1)}
              className="ma-focus mb-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[#6B7280] transition-colors duration-150 hover:bg-white hover:text-[#111111]"
            >
              <ArrowLeft size={15} strokeWidth={1.75} />
              Back
            </button>

            <h1
              data-testid="settings-heading"
              className="font-heading text-2xl font-semibold tracking-tight text-[#111111] sm:text-3xl"
            >
              Settings
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Manage your preferences, API keys, and account settings.
            </p>
          </motion.div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
            <nav className="shrink-0 lg:w-[220px]">
              <div className="sticky top-6 space-y-1 rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
                {SETTINGS_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      data-testid={`settings-tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`ma-focus flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${
                        isActive
                          ? "bg-[#F7F7F8] text-[#111111]"
                          : "text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111111]"
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.75} />
                      <div>
                        <span className="block text-sm font-medium">{tab.label}</span>
                        <span className="block text-[11px] leading-tight text-[#6B7280]">{tab.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="min-w-0 flex-1">
              <ActiveSection reduceMotion={reduceMotion} />
            </div>
          </div>
        </div>
      </main>

      <MobileNav activeNav={activeNav} onNavChange={handleNavChange} />

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
