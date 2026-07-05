/**
 * News Service
 * Uses RSS feeds (free, no API key) + RSS2JSON API (free, no key for basic use)
 */

const RSS2JSON_BASE = "https://api.rss2json.com/v1/api.json";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  image?: string;
  source: string;
  publishedAt: string;
}

// Free RSS feeds for football news
const FEEDS = [
  {
    url: "https://www.bbc.com/sport/football/rss.xml",
    source: "BBC Sport",
  },
  {
    url: "https://www.theguardian.com/football/rss",
    source: "The Guardian",
  },
  {
    url: "https://www.skysports.com/rss/12040",
    source: "Sky Sports",
  },
];

// ── Fetch via RSS2JSON (free, no key for basic use) ─────────────────────────

async function fetchRSSFeed(feedUrl: string, source: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `${RSS2JSON_BASE}?rss_url=${encodeURIComponent(feedUrl)}&count=5`
    );

    if (!res.ok) throw new Error(`RSS2JSON error: ${res.status}`);

    const data = await res.json();

    if (data.status !== "ok" || !data.items) return [];

    return data.items.map((item: any) => ({
      id: item.guid || item.link || Math.random().toString(),
      title: cleanHTML(item.title || ""),
      summary: cleanHTML(item.description || "").slice(0, 150) + "...",
      url: item.link || "#",
      image: extractImage(item),
      source,
      publishedAt: item.pubDate || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn(`Failed to fetch ${source} RSS:`, err);
    return [];
  }
}

export async function fetchFootballNews(): Promise<NewsItem[]> {
  // Try all feeds in parallel
  const results = await Promise.allSettled(
    FEEDS.map((feed) => fetchRSSFeed(feed.url, feed.source))
  );

  const allNews = results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // If we got news from any feed, return it
  if (allNews.length > 0) {
    // Sort by date, newest first
    return allNews
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 10);
  }

  // Fallback to static news
  return getFallbackNews();
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function cleanHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractImage(item: any): string | undefined {
  // Try enclosure
  if (item.enclosure?.link) return item.enclosure.link;

  // Try media:content
  if (item["media:content"]?.url) return item["media:content"].url;

  // Try to extract from description
  const desc = item.description || "";
  const imgMatch = desc.match(/<img[^>]+src="([^"]+)"/);
  if (imgMatch) return imgMatch[1];

  return undefined;
}

// ── Fallback News ───────────────────────────────────────────────────────────

function getFallbackNews(): NewsItem[] {
  return [
    {
      id: "n-1",
      title: "Piala Dunia 2026: 48 Tim Bersaing di 3 Negara",
      summary: "FIFA mengonfirmasi format baru dengan 48 tim yang akan bertanding di Amerika Serikat, Meksiko, dan Kanada.",
      url: "#",
      source: "FIFA",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "n-2",
      title: "Stadion MetLife Jadi Venue Final Piala Dunia 2026",
      summary: "Stadion berkapasitas 82.500 penonton ini akan menjadi tuan rumah pertandingan final.",
      url: "#",
      source: "ESPN",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "n-3",
      title: "Teknologi VAR Ditingkatkan untuk Piala Dunia 2026",
      summary: "FIFA memperkenalkan sistem VAR generasi terbaru dengan keputusan lebih cepat dan akurat.",
      url: "#",
      source: "BBC Sport",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "n-4",
      title: "Jadwal Lengkap Piala Dunia 2026 Sudah Dirilis",
      summary: "104 pertandingan akan dimainkan selama 39 hari di 16 stadion berbeda.",
      url: "#",
      source: "The Guardian",
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ];
}
