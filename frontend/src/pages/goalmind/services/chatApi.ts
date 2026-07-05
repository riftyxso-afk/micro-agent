/**
 * Chat Service
 * Connects to existing backend AI (FastAPI + 9router proxy)
 * Falls back to local responses if backend is unavailable
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

export interface ChatResponse {
  content: string;
  source: "ai" | "local";
}

// ── Backend AI Chat ─────────────────────────────────────────────────────────

export async function sendChatMessage(
  messages: { role: string; content: string }[],
  options: {
    modelId?: string;
    webSearch?: boolean;
    skillSlug?: string;
  } = {}
): Promise<ChatResponse> {
  // Try backend first
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model_id: options.modelId || "deepseek-v4-flash",
          web_search: options.webSearch || false,
          skill_slug: options.skillSlug || null,
          effort_level: "low",
        }),
      });

      if (res.ok) {
        const reader = res.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          let fullText = "";
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data: ")) {
                try {
                  const data = JSON.parse(trimmed.slice(6));
                  if (data.text) fullText += data.text;
                } catch {
                  // Ignore parse errors
                }
              }
            }
          }

          if (fullText) {
            return { content: fullText, source: "ai" };
          }
        }
      }
    } catch (err) {
      console.warn("Backend AI failed, using local fallback:", err);
    }
  }

  // Fallback to local responses
  return { content: getLocalResponse(messages[messages.length - 1]?.content || ""), source: "local" };
}

// ── Local Response Fallback ─────────────────────────────────────────────────

function getLocalResponse(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes("skor") || lower.includes("score") || lower.includes("hasil"))
    return `🔥 Skor Terkini:\n\n🇧🇷 Brasil 2 - 1 Jerman 🇩🇪\n⏱️ Menit 67\n⚽ Neymar 32', Vinicius 58'\n⚽ Musiala 45+1'\n📊 Penguasaan: 48% - 52%\n\n🇪🇸 Spanyol 0 - 0 Maroko 🇲🇦 (23')\n🇫🇷 Prancis 1 - 0 Senegal 🇸🇳 (45') ⚽ Mbappé 38'\n\n💡 Data dari fallback lokal. Hubungkan backend untuk data real-time.`;

  if (lower.includes("jadwal") || lower.includes("schedule"))
    return `📅 Jadwal Hari Ini:\n\n🕐 17:00 WIB — Brasil vs Jerman\n📍 MetLife Stadium, New York\n\n🕐 20:00 WIB — Spanyol vs Maroko\n📍 AT&T Stadium, Dallas\n\n🕐 23:00 WIB — Prancis vs Senegal\n📍 SoFi Stadium, Los Angeles\n\n💡 Data dari fallback lokal.`;

  if (lower.includes("klasemen") || lower.includes("standing") || lower.includes("grup"))
    return `🏆 Klasemen Grup A:\n\n1. 🇳🇱 Belanda — 6 poin (+3)\n2. 🇪🇨 Ekuador — 3 poin (0)\n3. 🇸🇳 Senegal — 3 poin (-1)\n4. 🇶🇦 Qatar — 0 poin (-2)\n\n💡 Data dari fallback lokal.`;

  if (lower.includes("prediksi") || lower.includes("prediction"))
    return `🧠 Prediksi Hari Ini:\n\n1. 🇧🇷 Brasil vs Jerman 🇩🇪\n   Brasil 52% | Seri 26% | Jerman 22%\n   Analisis: Brasil diunggulkan berkat form ofensif.\n\n2. 🇦🇷 Argentina vs Maroko 🇲🇦\n   Argentina 55% | Seri 25% | Maroko 20%\n   Analisis: Argentina dalam performa terbaik.\n\n💡 Prediksi dari model statis lokal.`;

  if (lower.includes("formasi") || lower.includes("formation") || lower.includes("pemain"))
    return `⚽ Formasi Brasil (4-3-3):\n\n         Richarlison\n  Raphinha    Vinicius Jr\n\n    Paquetá  Casemiro  B. Guimarães\n\n  Sandro  T. Silva  Marquinhos  Danilo\n\n           Alisson\n\n💡 Formasi dari data lokal.`;

  if (lower.includes("halo") || lower.includes("hai") || lower.includes("hello") || lower.includes("hi"))
    return `Halo! 👋\n\nSelamat datang di GoalMind AI!\n\nSaya bisa membantu Anda dengan:\n• Skor pertandingan live\n• Jadwal & klasemen\n• Prediksi & analisis\n• Formasi & taktik\n\nSilakan bertanya! 🏆`;

  return `Terima kasih atas pertanyaan Anda!\n\nUntuk pertanyaan tentang "${query}", saya sarankan:\n\n• Gunakan quick action di bawah untuk jawaban cepat\n• Atau tanyakan spesifik: "skor terkini", "jadwal hari ini", "klasemen grup"\n\n💡 Saat ini saya menggunakan data fallback lokal. Hubungkan backend AI untuk jawaban yang lebih cerdas.`;
}

// ── Quick Action Response ───────────────────────────────────────────────────

export function getQuickActionResponse(actionId: string): string {
  const responses: Record<string, string> = {
    "live-scores": `🔥 Skor Sementara:\n\n🇧🇷 Brasil 2 - 1 Jerman 🇩🇪\n⏱️ Menit 67\n⚽ Neymar (32'), Vinicius (58')\n⚽ Musiala (45+1')\n📊 Penguasaan: 48% - 52%\n\n🇪🇸 Spanyol 0 - 0 Maroko 🇲🇦 (23')\n\n🇫🇷 Prancis 1 - 0 Senegal 🇸🇳 (45')\n⚽ Mbappé (38')`,

    predictions: `🧠 Prediksi Hari Ini:\n\n1. 🇧🇷 Brasil vs Jerman 🇩🇪\n   Brasil 52% | Seri 26% | Jerman 22%\n\n2. 🇦🇷 Argentina vs Maroko 🇲🇦\n   Argentina 55% | Seri 25% | Maroko 20%\n\n3. 🇫🇷 Prancis vs Senegal 🇸🇳\n   Prancis 60% | Seri 22% | Senegal 18%`,

    schedule: `📅 Jadwal Pertandingan:\n\n🕐 17:00 WIB — Brasil vs Jerman\n📍 MetLife Stadium\n\n🕐 20:00 WIB — Spanyol vs Maroko\n📍 AT&T Stadium\n\n🕐 23:00 WIB — Prancis vs Senegal\n📍 SoFi Stadium`,

    standings: `🏆 Klasemen Grup A:\n\n1. 🇳🇱 Belanda — 6 pts\n2. 🇪🇨 Ekuador — 3 pts\n3. 🇸🇳 Senegal — 3 pts\n4. 🇶🇦 Qatar — 0 pts`,
  };

  return responses[actionId] || "Data tidak tersedia.";
}
