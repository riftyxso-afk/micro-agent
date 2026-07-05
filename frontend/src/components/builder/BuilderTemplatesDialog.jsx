import { useState } from "react";
import { createBuilderProject } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Layers,
  ArrowRight,
  Rocket,
  ShoppingBag,
  Briefcase,
  BarChart2,
  BookOpen,
  CalendarDays,
  Globe,
  Layout,
  Smartphone,
  Store,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TEMPLATES = [
  {
    id: "saas-landing",
    name: "SaaS Landing Page",
    description: "Hero, features, pricing, and CTA sections.",
    category: "Landing",
    icon: Rocket,
    accent: "bg-indigo-50 text-indigo-500",
    prompt: "Build a modern SaaS landing page with hero section, features grid, pricing table, and footer.",
  },
  {
    id: "ecommerce",
    name: "E-commerce Store",
    description: "Product grid, cart, and checkout flow.",
    category: "Store",
    icon: ShoppingBag,
    accent: "bg-emerald-50 text-emerald-600",
    prompt: "Build an e-commerce store with product listings, shopping cart, and checkout page.",
  },
  {
    id: "portfolio",
    name: "Portfolio Site",
    description: "Personal or agency showcase with projects.",
    category: "Portfolio",
    icon: Briefcase,
    accent: "bg-rose-50 text-rose-500",
    prompt: "Build a portfolio website with hero, about, projects grid, and contact section.",
  },
  {
    id: "dashboard",
    name: "Analytics Dashboard",
    description: "Charts, KPI cards, and data tables.",
    category: "App",
    icon: BarChart2,
    accent: "bg-amber-50 text-amber-600",
    prompt: "Build an analytics dashboard with KPI cards, line charts, bar charts, and a data table.",
  },
  {
    id: "blog",
    name: "Blog Platform",
    description: "Article listing, post detail, and categories.",
    category: "Content",
    icon: BookOpen,
    accent: "bg-violet-50 text-violet-500",
    prompt: "Build a blog platform with article listing page, post detail view, and category filters.",
  },
  {
    id: "booking",
    name: "Booking System",
    description: "Calendar, time slots, and confirmation flow.",
    category: "App",
    icon: CalendarDays,
    accent: "bg-sky-50 text-sky-500",
    prompt: "Build a booking system with calendar view, time slot selection, and booking confirmation.",
  },
  {
    id: "landing-basic",
    name: "Simple Landing Page",
    description: "Minimal one-page with CTA and contact form.",
    category: "Landing",
    icon: Layout,
    accent: "bg-pink-50 text-pink-500",
    prompt: "Build a minimal landing page with headline, subheadline, CTA button, and contact form.",
  },
  {
    id: "mobile-app",
    name: "Mobile App Landing",
    description: "App showcase with screenshots and download links.",
    category: "Landing",
    icon: Smartphone,
    accent: "bg-teal-50 text-teal-500",
    prompt: "Build a mobile app landing page with app screenshots, feature list, and download buttons.",
  },
  {
    id: "company-profile",
    name: "Company Profile",
    description: "About, team, services, and contact.",
    category: "Business",
    icon: Globe,
    accent: "bg-blue-50 text-blue-500",
    prompt: "Build a company profile website with about page, team section, services, and contact form.",
  },
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Listings, filters, seller profiles, and reviews.",
    category: "Store",
    icon: Store,
    accent: "bg-orange-50 text-orange-500",
    prompt: "Build a marketplace with product listings, search filters, seller profiles, and reviews.",
  },
];

const CATEGORIES = ["All", "Landing", "Store", "App", "Content", "Business", "Portfolio"];

export function BuilderTemplatesDialog({ open, onOpenChange }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === activeCategory);

  const handleUse = async (template) => {
    onOpenChange(false);
    try {
      const project = await createBuilderProject({
        name: template.name || template.prompt.slice(0, 60),
        last_prompt: template.prompt,
      });
      navigate(`/project/${project.id}`, {
        state: { initialPrompt: template.prompt },
      });
    } catch (err) {
      console.error("[BuilderTemplatesDialog] createBuilderProject error:", err);
      navigate(`/project/${crypto.randomUUID()}`, {
        state: { initialPrompt: template.prompt },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="builder-templates-dialog"
        className="left-0 top-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-[#E5E7EB] bg-[#FCFCFD] p-0 sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[80vh] sm:w-full sm:max-w-[680px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#F0F1F3] px-5 pb-4 pt-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F0F4FF] text-[#1F55F1]">
            <Layers size={17} strokeWidth={1.75} />
          </span>
          <div>
            <DialogTitle className="text-base font-semibold text-[#111111]">
              Templates
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-[#6B7280]">
              Start from a ready-made project template
            </DialogDescription>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-5 py-3 border-b border-[#F0F1F3] scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
                activeCategory === cat
                  ? "bg-[#111111] text-white"
                  : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#374151]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto p-4 sm:grid-cols-2">
          {filtered.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                type="button"
                data-testid={`builder-template-${template.id}`}
                onClick={() => handleUse(template)}
                className="group flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left shadow-sm transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#D1D5DB] hover:shadow-md active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F55F1]"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl ${template.accent}`}>
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <span className="rounded-full bg-[#F7F7F8] px-2 py-0.5 text-[11px] font-medium text-[#6B7280]">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-[14px] font-semibold text-[#111111] leading-snug">
                  {template.name}
                </h3>
                <p className="mt-1 flex-1 text-[12px] leading-relaxed text-[#6B7280]">
                  {template.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#1F55F1]">
                  Use template
                  <ArrowRight size={11} strokeWidth={2.5} className="transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
