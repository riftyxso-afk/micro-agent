export interface Match {
  id: string;
  home: string;
  away: string;
  homeFlag: string;
  awayFlag: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: 'live' | 'finished' | 'upcoming';
  goalScorers: string[];
  possession?: { home: number; away: number };
  shotsOnTarget?: { home: number; away: number };
}

export interface Prediction {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeWin: number;
  draw: number;
  awayWin: number;
  factors: PredictionFactor[];
  reasoning: string;
  startingXI: StartingXI;
}

export interface PredictionFactor {
  name: string;
  value: number;
  icon: string;
}

export interface StartingXI {
  formation: string;
  players: Player[];
}

export interface Player {
  name: string;
  position: string;
  row: number;
  col: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  response: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  time: string;
}

export type MenuId = 'chat' | 'predictions' | 'fantasy' | 'schedule' | 'standings' | 'news';
