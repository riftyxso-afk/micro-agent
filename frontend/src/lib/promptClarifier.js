// Only trigger clarification for the most genuinely ambiguous single-word requests.
// Do NOT block short prompts like "apa itu AI" or normal greetings.
const VAGUE_PATTERNS = [
  /^(bantu|help|tolong|code|coding|program|tugas)\s*$/i,
  /^(bantu|coding|help|code|program|tolong)\s+(aku|saya|me|gua|gue|kami)\s*$/i,
];

const CODING_OPTIONS = [
  {
    id: "web-dev",
    icon: "Globe",
    title: "Web Development",
    desc: "Frontend, backend, atau fullstack — React, Node, PHP, Laravel, dll",
    refine: (text) => `Saya butuh bantuan web development: ${text}`,
  },
  {
    id: "data-science",
    icon: "BarChart3",
    title: "Data Science & AI",
    desc: "Python, machine learning, analisis data, scraping, visualisasi",
    refine: (text) => `Saya butuh bantuan data science / AI: ${text}`,
  },
  {
    id: "debugging",
    icon: "Bug",
    title: "Debugging & Error",
    desc: "Perbaiki error, cari bug, optimasi kode, refactoring",
    refine: (text) => `Tolong bantu debug kode berikut:\n${text}`,
  },
  {
    id: "other",
    icon: "Terminal",
    title: "Lainnya",
    desc: "Script, otomasi, API, database, atau request custom",
    refine: (text) => text,
  },
];

export function isVaguePrompt(text) {
  const clean = text.trim();
  if (!clean) return false;
  return VAGUE_PATTERNS.some((p) => p.test(clean));
}

export function getCodingOptions() {
  return CODING_OPTIONS;
}

export function refinePrompt(optionId, userInput) {
  const option = CODING_OPTIONS.find((o) => o.id === optionId);
  if (!option) return userInput;
  return option.refine(userInput);
}
