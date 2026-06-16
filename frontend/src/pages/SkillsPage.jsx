import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Download, Plus, Trash2, ArrowLeft, ExternalLink, FileText, X, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/chatApi";
import { useAuth } from "@/lib/AuthContext";
import { fetchUserSkills, installUserSkill, uninstallUserSkill, isSupabaseEnabled } from "@/lib/supabase";

export default function SkillsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [userSkillSlugs, setUserSkillSlugs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("list");
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [customForm, setCustomForm] = useState({ name: "", description: "", icon: "🧠", category: "custom", content: "" });
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => { fetchSkills(); fetchUserInstalls(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserInstalls = async () => {
    if (!isSupabaseEnabled || !user) return;
    try {
      const installed = await fetchUserSkills();
      setUserSkillSlugs(new Set(installed.map((s) => s.skill_slug)));
    } catch {}
  };

  const handleToggleInstall = async (skill) => {
    if (!isSupabaseEnabled || !user) {
      setMessage({ type: "error", text: "Sign in to install skills" });
      return;
    }
    setToggling(skill.slug);
    try {
      if (userSkillSlugs.has(skill.slug)) {
        await uninstallUserSkill(skill.slug);
        setUserSkillSlugs((prev) => { const n = new Set(prev); n.delete(skill.slug); return n; });
      } else {
        await installUserSkill(skill.slug, skill.source || "");
        setUserSkillSlugs((prev) => new Set([...prev, skill.slug]));
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Failed" });
    }
    setToggling(null);
  };

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/skills`);
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (e) {
      setMessage({ type: "error", text: "Failed to load skills" });
    }
    setLoading(false);
  };

  const handleImportZip = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/skills/import-zip`, { method: "POST", body: form });
      const data = await res.json();
      setMessage({ type: data.errors?.length ? "warning" : "success", text: `Imported ${data.imported?.length || 0} skills${data.errors?.length ? `, ${data.errors.length} errors` : ""}` });
      fetchSkills();
    } catch (e) {
      setMessage({ type: "error", text: "Import failed" });
    }
    setImporting(false);
    e.target.value = "";
  };

  const handleImportGithub = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    try {
      const form = new FormData();
      form.append("url", importUrl);
      const res = await fetch(`${API_BASE_URL}/api/skills/import-github`, { method: "POST", body: form });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: `Imported: ${data.slug}` });
        setImportUrl("");
        fetchSkills();
      }
    } catch (e) {
      setMessage({ type: "error", text: "Import failed" });
    }
    setImporting(false);
  };

  const handleCreateSkill = async () => {
    if (!customForm.name.trim()) return;
    setCreating(true);
    try {
      const form = new FormData();
      form.append("name", customForm.name);
      form.append("description", customForm.description);
      form.append("icon", customForm.icon);
      form.append("category", customForm.category);
      form.append("content", customForm.content);
      const res = await fetch(`${API_BASE_URL}/api/skills/create`, { method: "POST", body: form });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: `Created: ${data.name}` });
        setCustomForm({ name: "", description: "", icon: "🧠", category: "custom", content: "" });
        setTab("list");
        fetchSkills();
      }
    } catch (e) {
      setMessage({ type: "error", text: "Create failed" });
    }
    setCreating(false);
  };

  const handleDelete = async (slug) => {
    setDeleting(slug);
    try {
      const res = await fetch(`${API_BASE_URL}/api/skills/${slug}`, { method: "DELETE" });
      const data = await res.json();
      setMessage({ type: data.error ? "error" : "success", text: data.message || data.error });
      fetchSkills();
    } catch (e) {
      setMessage({ type: "error", text: "Delete failed" });
    }
    setDeleting(null);
  };

  const builtin = skills.filter((s) => s.builtin);
  const custom = skills.filter((s) => !s.builtin);

  return (
    <div className="min-h-dvh bg-[#F7F7F8]">
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="ma-focus grid h-9 w-9 place-items-center rounded-xl text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111]">
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <h1 className="text-lg font-semibold text-[#111111]">Skills</h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {message && (
          <div className={`mb-4 flex items-center justify-between rounded-xl px-4 py-2.5 text-sm ${
            message.type === "error" ? "bg-[#FEF2F2] text-[#991B1B]" :
            message.type === "warning" ? "bg-[#FFFBEB] text-[#92400E]" :
            "bg-[#F0FDF4] text-[#166534]"
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-2 grid h-5 w-5 place-items-center rounded-full hover:bg-black/5">
              <X size={12} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Tab bar */}
        <div className="mb-6 flex gap-1.5 rounded-xl bg-[#F3F4F6] p-1">
          {[
            { id: "list", label: "Installed", icon: FileText },
            { id: "import", label: "Import", icon: Download },
            { id: "create", label: "Create", icon: Plus },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`ma-focus flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
                tab === t.id ? "bg-white text-[#111111] shadow-sm" : "text-[#6B7280] hover:text-[#111111]"
              }`}
            >
              <t.icon size={15} strokeWidth={1.75} />
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-[#6B7280]" />
          </div>
        ) : tab === "list" ? (
          <div className="space-y-4">
            {/* Built-in skills */}
            <div>
              <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Built-in ({builtin.length})</h2>
              <div className="space-y-1">
                {builtin.map((s) => {
                  const installed = userSkillSlugs.has(s.slug);
                  return (
                    <div key={s.slug} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
                      <span className="text-lg">{s.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#111111]">{s.name}</p>
                        <p className="truncate text-xs text-[#6B7280]">{s.description}</p>
                      </div>
                      {isSupabaseEnabled && (
                        <button onClick={() => handleToggleInstall(s)} disabled={toggling === s.slug}
                          className={`ma-focus shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-50 ${
                            installed ? "bg-[#EEF2FF] text-[#4338CA] hover:bg-[#E0E7FF]" : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                          }`}
                        >
                          {toggling === s.slug ? <Loader2 size={11} strokeWidth={1.5} className="animate-spin" /> : installed ? "Installed" : "Install"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Custom skills */}
            {custom.length > 0 && (
              <div>
                <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Custom ({custom.length})</h2>
                <div className="space-y-1">
                  {custom.map((s) => {
                    const installed = userSkillSlugs.has(s.slug);
                    return (
                      <div key={s.slug} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
                        <span className="text-lg">{s.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#111111]">{s.name}</p>
                          <p className="truncate text-xs text-[#6B7280]">{s.description}</p>
                        </div>
                        {isSupabaseEnabled && (
                          <button onClick={() => handleToggleInstall(s)} disabled={toggling === s.slug}
                            className={`ma-focus shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-50 ${
                              installed ? "bg-[#EEF2FF] text-[#4338CA] hover:bg-[#E0E7FF]" : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                            }`}
                          >
                            {toggling === s.slug ? <Loader2 size={11} strokeWidth={1.5} className="animate-spin" /> : installed ? "Installed" : "Install"}
                          </button>
                        )}
                        <button onClick={() => handleDelete(s.slug)} disabled={deleting === s.slug}
                          className="ma-focus grid h-8 w-8 place-items-center rounded-lg text-[#9CA3AF] hover:bg-[#FEF2F2] hover:text-[#EF4444] disabled:opacity-50"
                        >
                          {deleting === s.slug ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <Trash2 size={14} strokeWidth={1.75} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {custom.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-[#E5E7EB] py-12 text-center">
                <p className="text-sm text-[#9CA3AF]">No custom skills yet. Import or create one!</p>
              </div>
            )}
          </div>
        ) : tab === "import" ? (
          <div className="space-y-6">
            {/* Import from ZIP */}
            <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#111111]">
                <Upload size={16} strokeWidth={1.75} />
                Import from ZIP
              </h3>
              <label className="ma-focus flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E5E7EB] px-4 py-6 text-sm text-[#6B7280] transition-colors hover:border-[#3B6EF6]/30 hover:bg-[#F7F7F8]">
                <Upload size={18} strokeWidth={1.5} />
                <span>{importing ? "Importing..." : "Click to upload .zip file"}</span>
                <input type="file" accept=".zip" onChange={handleImportZip} className="hidden" disabled={importing} />
              </label>
            </div>
            {/* Import from GitHub */}
            <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#111111]">
                <ExternalLink size={16} strokeWidth={1.75} />
                Import from GitHub
              </h3>
              <p className="mb-3 text-xs text-[#6B7280]">
                Paste a GitHub URL pointing to a skill .md file or a repo containing skill files.
              </p>
              <div className="flex gap-2">
                <input value={importUrl} onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://github.com/user/repo/blob/main/skill.md"
                  className="ma-focus min-w-0 flex-1 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#3B6EF6]/50"
                />
                <button onClick={handleImportGithub} disabled={importing || !importUrl.trim()}
                  className="ma-focus shrink-0 rounded-xl bg-[#111111] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2D2D2D] disabled:opacity-50"
                >
                  {importing ? "..." : "Import"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Create custom skill */
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#111111]">
              <Plus size={16} strokeWidth={1.75} />
              Create Custom Skill
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">Name</label>
                <input value={customForm.name} onChange={(e) => setCustomForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="My Custom Skill"
                  className="ma-focus w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#3B6EF6]/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">Description</label>
                <input value={customForm.description} onChange={(e) => setCustomForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What this skill does"
                  className="ma-focus w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#3B6EF6]/50"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-[#6B7280]">Icon (emoji)</label>
                  <input value={customForm.icon} onChange={(e) => setCustomForm((f) => ({ ...f, icon: e.target.value }))}
                    className="ma-focus w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#3B6EF6]/50"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-[#6B7280]">Category</label>
                  <select value={customForm.category} onChange={(e) => setCustomForm((f) => ({ ...f, category: e.target.value }))}
                    className="ma-focus w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#3B6EF6]/50"
                  >
                    <option value="custom">Custom</option>
                    <option value="writing">Writing</option>
                    <option value="coding">Coding</option>
                    <option value="analysis">Analysis</option>
                    <option value="productivity">Productivity</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">Instructions (markdown)</label>
                <textarea value={customForm.content} onChange={(e) => setCustomForm((f) => ({ ...f, content: e.target.value }))}
                  rows={8}
                  placeholder="# Skill Name&#10;&#10;## Role&#10;You are...&#10;&#10;## Rules&#10;- Be specific&#10;- Follow guidelines"
                  className="ma-focus w-full resize-none rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#3B6EF6]/50"
                />
              </div>
              <button onClick={handleCreateSkill} disabled={creating || !customForm.name.trim()}
                className="ma-focus w-full rounded-xl bg-[#111111] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2D2D2D] disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Skill"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
