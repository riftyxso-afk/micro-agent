import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const isSupabaseEnabled = !!supabase;

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function signUp(email, password) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

export async function getUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export function onAuthChange(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => data.subscription.unsubscribe();
}

// ── Chat sessions ─────────────────────────────────────────────────────────────

export async function fetchSessions() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createSession({ title = "New Chat", model_id = "", room = "" } = {}) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("sessions")
    .insert({ title, model_id, room })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSession(id, patch) {
  if (!supabase) return;
  await supabase.from("sessions").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
}

export async function deleteSession(id) {
  if (!supabase) return;
  await supabase.from("sessions").delete().eq("id", id);
}

export async function fetchMessages(sessionId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at");
  if (error) throw error;
  return data || [];
}

export async function saveMessages(sessionId, messages) {
  if (!supabase || !messages.length) return;
  const rows = messages.map((m) => ({
    session_id: sessionId,
    role: m.role,
    text: m.text || "",
    model_id: m.model?.id || "",
    search_mode: m.searchMode || "",
    skill_slug: m.skillSlug || null,
    effort_level: m.effortLevel || "",
    image_url: m.imageUrl || null,
    metadata: { state: m.state, thinkingSteps: m.thinkingSteps },
  }));
  await supabase.from("messages").insert(rows);
  await supabase.from("sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);
}

// ── File storage ────────────────────────────────────────────────────────────

export async function uploadFileToStorage(file, userId) {
  if (!supabase) throw new Error("Supabase not configured");
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from("chat-files")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("chat-files").getPublicUrl(path);
  return { path, url: urlData.publicUrl, name: file.name, type: file.type, size: file.size };
}

export async function deleteFileFromStorage(path) {
  if (!supabase) return;
  await supabase.storage.from("chat-files").remove([path]);
}

// ── Skill installs ──────────────────────────────────────────────────────────────

export async function fetchUserSkills() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("skill_installs")
    .select("*")
    .order("installed_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function installUserSkill(slug, source = "") {
  if (!supabase) return;
  await supabase.from("skill_installs").upsert(
    { skill_slug: slug, source },
    { onConflict: "user_id,skill_slug" }
  );
}

export async function uninstallUserSkill(slug) {
  if (!supabase) return;
  await supabase.from("skill_installs").delete().eq("skill_slug", slug);
}
