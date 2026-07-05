/**
 * Football Data Service
 * Primary: SportSRC API (free, no key, CORS enabled)
 * Fallback: API-Football via RapidAPI (needs active subscription)
 */

const API_FOOTBALL_KEY = process.env.REACT_APP_FOOTBALL_API_KEY || "";
const API_FOOTBALL_HOST = process.env.REACT_APP_FOOTBALL_API_HOST || "api-football-v1.p.rapidapi.com";
const SPORTSRC_BASE = "https://api.sportsrc.org";

export interface LiveMatch {
  id: string;
  home: string;
  away: string;
  homeFlag: string;
  awayFlag: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: "live" | "finished" | "upcoming";
  goalScorers: string[];
  possession?: { home: number; away: number };
  league?: string;
  time?: string;
}

export interface Standing {
  rank: number;
  team: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Schedule {
  id: string;
  home: string;
  away: string;
  homeFlag: string;
  awayFlag: string;
  date: string;
  time: string;
  venue: string;
  status: "upcoming" | "live" | "finished";
  score?: { home: number; away: number };
}

// ── API-Football (Primary) ──────────────────────────────────────────────────

async function fetchAPIFootball<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!API_FOOTBALL_KEY) {
    throw new Error("API-Football key not configured");
  }

  const queryString = new URLSearchParams(params).toString();
  const url = `https://${API_FOOTBALL_HOST}/v3/${endpoint}${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-key": API_FOOTBALL_KEY,
      "x-rapidapi-host": API_FOOTBALL_HOST,
    },
  });

  if (!res.ok) {
    throw new Error(`API-Football error: ${res.status}`);
  }

  return res.json();
}

export async function fetchLiveScores(): Promise<LiveMatch[]> {
  // Try SportSRC first (free, no key)
  try {
    return await fetchSportSRCLive();
  } catch (err) {
    console.warn("SportSRC failed, trying API-Football:", err);
  }

  // Fallback to API-Football (needs active subscription)
  if (API_FOOTBALL_KEY) {
    try {
      const data = await fetchAPIFootball<any>("fixtures", {
        live: "all",
      });

      const fixtures = data?.response || [];

      return fixtures.slice(0, 5).map((f: any) => ({
        id: String(f.fixture?.id || Math.random()),
        home: f.teams?.home?.name || "Home",
        away: f.teams?.away?.name || "Away",
        homeFlag: f.teams?.home?.logo ? "" : getFlagEmoji(f.teams?.home?.name || ""),
        awayFlag: f.teams?.away?.logo ? "" : getFlagEmoji(f.teams?.away?.name || ""),
        homeScore: f.goals?.home || 0,
        awayScore: f.goals?.away || 0,
        minute: f.fixture?.status?.elapsed || 0,
        status: "live",
        goalScorers: extractGoalsFromEvents(f.events),
        league: f.league?.name || "",
      }));
    } catch (err) {
      console.warn("API-Football also failed:", err);
    }
  }

  // Final fallback to dummy data
  return getFallbackLiveMatches();
}

export async function fetchSchedule(): Promise<Schedule[]> {
  // Try SportSRC first
  try {
    return await fetchSportSRCSchedule();
  } catch (err) {
    console.warn("SportSRC schedule failed:", err);
  }

  // Fallback to API-Football
  if (API_FOOTBALL_KEY) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = await fetchAPIFootball<any>("fixtures", {
        date: today,
      });

      const fixtures = data?.response || [];

      return fixtures.slice(0, 10).map((f: any) => ({
        id: String(f.fixture?.id || Math.random()),
        home: f.teams?.home?.name || "Home",
        away: f.teams?.away?.name || "Away",
        homeFlag: getFlagEmoji(f.teams?.home?.name || ""),
        awayFlag: getFlagEmoji(f.teams?.away?.name || ""),
        date: f.fixture?.date || today,
        time: f.fixture?.date?.split("T")[1]?.slice(0, 5) || "",
        venue: f.fixture?.venue?.name || "",
        status: f.fixture?.status?.short === "NS" ? "upcoming" : f.fixture?.status?.short === "1H" || f.fixture?.status?.short === "2H" ? "live" : "finished",
        score: f.goals?.home !== null ? { home: f.goals?.home || 0, away: f.goals?.away || 0 } : undefined,
      }));
    } catch (err) {
      console.warn("API-Football schedule also failed:", err);
    }
  }

  return getFallbackSchedule();
}

export async function fetchStandings(): Promise<Standing[]> {
  // Try SportSRC first
  try {
    return await fetchSportSRCStandings();
  } catch (err) {
    console.warn("SportSRC standings failed:", err);
  }

  // Fallback to API-Football
  if (API_FOOTBALL_KEY) {
    try {
      // World Cup 2026 league ID (you may need to update this)
      const data = await fetchAPIFootball<any>("standings", {
        league: "1", // Update with correct league ID
        season: "2026",
      });

      const standings = data?.response?.[0]?.league?.standings?.[0] || [];

      return standings.map((s: any) => ({
        rank: s.rank || 0,
        team: s.team?.name || "",
        flag: getFlagEmoji(s.team?.name || ""),
        played: s.all?.played || 0,
        won: s.all?.win || 0,
        drawn: s.all?.draw || 0,
        lost: s.all?.lose || 0,
        goalsFor: s.all?.goals?.for || 0,
        goalsAgainst: s.all?.goals?.against || 0,
        goalDifference: s.goalsDiff || 0,
        points: s.points || 0,
      }));
    } catch (err) {
      console.warn("API-Football standings also failed:", err);
    }
  }

  return getFallbackStandings();
}

// ── SportSRC API (Fallback) ────────────────────────────────────────────────

async function fetchSportSRC<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${SPORTSRC_BASE}/?data=${endpoint}&category=football`);
  if (!res.ok) throw new Error(`SportSRC error: ${res.status}`);
  return res.json();
}

async function fetchSportSRCLive(): Promise<LiveMatch[]> {
  try {
    const data = await fetchSportSRC<any>("matches");
    const matches = Array.isArray(data) ? data : data?.matches || data?.data || [];

    return matches
      .filter((m: any) => m.status === "live" || m.status === "1")
      .slice(0, 5)
      .map((m: any) => ({
        id: String(m.id || m.match_id || Math.random()),
        home: m.home_team || m.team1 || m.home || "Home",
        away: m.away_team || m.team2 || m.away || "Away",
        homeFlag: getFlagEmoji(m.home_team || m.team1 || m.home || ""),
        awayFlag: getFlagEmoji(m.away_team || m.team2 || m.away || ""),
        homeScore: parseInt(m.home_score || m.score?.[0] || m.goals_home || "0"),
        awayScore: parseInt(m.away_score || m.score?.[1] || m.goals_away || "0"),
        minute: parseInt(m.minute || m.elapsed || "0"),
        status: "live",
        goalScorers: extractGoals(m),
        possession: m.possession || undefined,
        league: m.league || m.competition || "",
      }));
  } catch (err) {
    console.warn("SportSRC failed:", err);
    return getFallbackLiveMatches();
  }
}

async function fetchSportSRCSchedule(): Promise<Schedule[]> {
  try {
    const data = await fetchSportSRC<any>("matches");
    const matches = Array.isArray(data) ? data : data?.matches || data?.data || [];

    return matches.slice(0, 10).map((m: any) => ({
      id: String(m.id || m.match_id || Math.random()),
      home: m.home_team || m.team1 || m.home || "Home",
      away: m.away_team || m.team2 || m.away || "Away",
      homeFlag: getFlagEmoji(m.home_team || m.team1 || m.home || ""),
      awayFlag: getFlagEmoji(m.away_team || m.team2 || m.away || ""),
      date: m.date || m.datetime || new Date().toISOString(),
      time: m.time || "",
      venue: m.venue || m.stadium || "",
      status: m.status === "live" || m.status === "1" ? "live" : m.status === "finished" || m.status === "3" ? "finished" : "upcoming",
      score: m.score ? { home: m.score[0], away: m.score[1] } : undefined,
    }));
  } catch (err) {
    console.warn("SportSRC schedule failed:", err);
    return getFallbackSchedule();
  }
}

async function fetchSportSRCStandings(): Promise<Standing[]> {
  try {
    const data = await fetchSportSRC<any>("tables");
    const table = Array.isArray(data) ? data[0] : data?.tables?.[0] || data?.data?.[0];

    if (!table?.standings) return getFallbackStandings();

    return table.standings.map((s: any, i: number) => ({
      rank: s.rank || i + 1,
      team: s.team || s.team_name || "",
      flag: getFlagEmoji(s.team || s.team_name || ""),
      played: parseInt(s.played || s.games_played || "0"),
      won: parseInt(s.won || s.win || "0"),
      drawn: parseInt(s.drawn || s.draw || "0"),
      lost: parseInt(s.lost || s.loss || "0"),
      goalsFor: parseInt(s.goals_for || s.gf || "0"),
      goalsAgainst: parseInt(s.goals_against || s.ga || "0"),
      goalDifference: parseInt(s.goal_difference || s.gd || "0"),
      points: parseInt(s.points || s.pts || "0"),
    }));
  } catch (err) {
    console.warn("SportSRC standings failed:", err);
    return getFallbackStandings();
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getFlagEmoji(country: string): string {
  const flags: Record<string, string> = {
    brazil: "🇧🇷", brasil: "🇧🇷", germany: "🇩🇪", jerman: "🇩🇪",
    argentina: "🇦🇷", spain: "🇪🇸", spanyol: "🇪🇸", france: "🇫🇷", prancis: "🇫🇷",
    england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", inggris: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", italy: "🇮🇹", belgium: "🇧🇪",
    netherlands: "🇳🇱", belanda: "🇳🇱", portugal: "🇵🇹", japan: "🇯🇵", jepang: "🇯🇵",
    korea: "🇰🇷", "south korea": "🇰🇷", korsel: "🇰🇷", mexico: "🇲🇽", meksiko: "🇲🇽",
    usa: "🇺🇸", "united states": "🇺🇸", amerika: "🇺🇸", canada: "🇨🇦", kanada: "🇨🇦",
    senegal: "🇸🇳", morocco: "🇲🇦", maroko: "🇲🇦", nigeria: "🇳🇬",
    australia: "🇦🇺", croatia: "🇭🇷", kroasia: "🇭🇷",
    denmark: "🇩🇰", sweden: "🇸🇪", switzerland: "🇨🇭", poland: "🇵🇱", polandia: "🇵🇱",
    uruguay: "🇺🇾", colombia: "🇨🇴", ecuador: "🇪🇨", ekuador: "🇪🇨",
    qatar: "🇶🇦", "saudi arabia": "🇸🇦", arab: "🇸🇦",
    wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", czech: "🇨🇿", scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    serbia: "🇷🇸", ukraine: "🇺🇦", austria: "🇦🇹", hungary: "🇭🇺", turkiye: "🇹🇷",
    "south africa": "🇿🇦", ghana: "🇬🇭", tunisia: "🇹🇳", algeria: "🇩🇿",
    peru: "🇵🇪", chile: "🇨🇱", paraguay: "🇵🇾", bolivia: "🇧🇴", venezuela: "🇻🇪",
    panama: "🇵🇦", "costa rica": "🇨🇷", jamaica: "🇯🇲",
    greece: "🇬🇷", romania: "🇷🇴", bulgaria: "🇧🇬", norway: "🇳🇴", finland: "🇫🇮",
    iceland: "🇮🇸", ireland: "🇮🇪",
    china: "🇨🇳", thailand: "🇹🇭", vietnam: "🇻🇳",
    malaysia: "🇲🇾", philippines: "🇵🇭", singapore: "🇸🇬", "new zealand": "🇳🇿",
  };

  const lower = country.toLowerCase().trim();

  if (flags[lower]) return flags[lower];

  for (const [key, flag] of Object.entries(flags)) {
    if (lower.includes(key) || key.includes(lower)) return flag;
  }

  return "🏳️";
}

function extractGoalsFromEvents(events: any[]): string[] {
  if (!events || !Array.isArray(events)) return [];

  return events
    .filter((e: any) => e.type === "Goal")
    .map((e: any) => {
      const player = e.player?.name || e.team?.name || "";
      const minute = e.time?.elapsed || "";
      return `${player}${minute ? ` ${minute}'` : ""}`;
    });
}

function extractGoals(match: any): string[] {
  const goals: string[] = [];
  const events = match.events || match.goals || match.scorers || [];

  if (Array.isArray(events)) {
    events.forEach((e: any) => {
      const player = e.player || e.scorer || e.name || "";
      const minute = e.minute || e.time || "";
      if (player) goals.push(`${player}${minute ? ` ${minute}'` : ""}`);
    });
  }

  return goals;
}

// ── Fallback Data ───────────────────────────────────────────────────────────

function getFallbackLiveMatches(): LiveMatch[] {
  return [
    {
      id: "fb-1",
      home: "Brasil",
      away: "Jerman",
      homeFlag: "🇧🇷",
      awayFlag: "🇩🇪",
      homeScore: 2,
      awayScore: 1,
      minute: 67,
      status: "live",
      goalScorers: ["Neymar 32'", "Vinicius 58'", "Musiala 45+1'"],
      possession: { home: 48, away: 52 },
    },
    {
      id: "fb-2",
      home: "Spanyol",
      away: "Maroko",
      homeFlag: "🇪🇸",
      awayFlag: "🇲🇦",
      homeScore: 0,
      awayScore: 0,
      minute: 23,
      status: "live",
      goalScorers: [],
      possession: { home: 61, away: 39 },
    },
  ];
}

function getFallbackSchedule(): Schedule[] {
  return [
    { id: "s-1", home: "Brasil", away: "Jerman", homeFlag: "🇧🇷", awayFlag: "🇩🇪", date: "2026-06-29", time: "17:00", venue: "MetLife Stadium", status: "upcoming" },
    { id: "s-2", home: "Spanyol", away: "Maroko", homeFlag: "🇪🇸", awayFlag: "🇲🇦", date: "2026-06-29", time: "20:00", venue: "AT&T Stadium", status: "upcoming" },
    { id: "s-3", home: "Prancis", away: "Senegal", homeFlag: "🇫🇷", awayFlag: "🇸🇳", date: "2026-06-29", time: "23:00", venue: "SoFi Stadium", status: "upcoming" },
  ];
}

function getFallbackStandings(): Standing[] {
  return [
    { rank: 1, team: "Belanda", flag: "🇳🇱", played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 5, goalsAgainst: 2, goalDifference: 3, points: 6 },
    { rank: 2, team: "Ekuador", flag: "🇪🇨", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 3, goalsAgainst: 3, goalDifference: 0, points: 3 },
    { rank: 3, team: "Senegal", flag: "🇸🇳", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 3 },
    { rank: 4, team: "Qatar", flag: "🇶🇦", played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 0 },
  ];
}
