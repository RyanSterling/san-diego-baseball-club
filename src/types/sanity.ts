import type { PortableTextBlock } from "@portabletext/types";

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

export interface SocialLink {
  platform: "instagram" | "facebook" | "twitter" | "youtube";
  url: string;
}

export interface SiteSettings {
  teamName: string;
  tagline?: string;
  logo?: SanityImage;
  defaultGameChangerUrl?: string;
  contactEmail?: string;
  socialLinks?: SocialLink[];
}

export interface Season {
  _id: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export interface Player {
  _id: string;
  name: string;
  slug: string;
  jerseyNumber: number;
  position: "P" | "C" | "1B" | "2B" | "3B" | "SS" | "LF" | "CF" | "RF" | "DH" | "UTIL";
  photo?: SanityImage;
  bio?: string;
  battingSide?: "L" | "R" | "S";
  throwingSide?: "L" | "R";
  seasons?: { _id: string }[];
  isActive: boolean;
}

// Player stats embedded within a game
export interface PlayerStatLine {
  player: {
    _id: string;
    name: string;
    slug: string;
    jerseyNumber: number;
    position?: string;
  };
  // Batting
  plateAppearances?: number;
  atBats: number;
  hits: number;
  runs: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  stolenBases: number;
  // Pitching (optional)
  inningsPitched?: number;
  earnedRuns?: number;
  pitchingStrikeouts?: number;
  pitchingWalks?: number;
  hitsAllowed?: number;
}

export interface Game {
  _id: string;
  slug: string;
  date: string;
  opponent: string;
  location: string;
  homeOrAway: "home" | "away";
  result?: "W" | "L" | "T";
  ourScore?: number;
  theirScore?: number;
  recap?: PortableTextBlock[];
  gameChangerLink?: string;
  hasRecap?: boolean;
  playerStats?: PlayerStatLine[];
  season?: {
    name: string;
    slug: string;
  };
  // Box score
  ourInnings?: number[];
  theirInnings?: number[];
  ourHits?: number;
  theirHits?: number;
  ourErrors?: number;
  theirErrors?: number;
}

export interface Practice {
  _id: string;
  date: string;
  location: string;
  notes?: string;
  season?: {
    name: string;
  };
}

export interface RecurringPractice {
  _id: string;
  dayOfWeek: string; // "0" = Sunday, "6" = Saturday
  time: string;
  location: string;
  notes?: string;
  isActive: boolean;
}

// Game with embedded player stats (for stats queries)
export interface GameWithStats {
  _id: string;
  date: string;
  opponent: string;
  playerStats: PlayerStatLine[];
}

// Player's stats for a specific game (used in player detail)
export interface PlayerGameEntry {
  _id: string;
  slug: string;
  date: string;
  opponent: string;
  playerStat?: {
    plateAppearances?: number;
    atBats: number;
    hits: number;
    runs: number;
    rbi: number;
    walks: number;
    strikeouts: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    stolenBases: number;
    inningsPitched?: number;
    earnedRuns?: number;
    pitchingStrikeouts?: number;
    pitchingWalks?: number;
    hitsAllowed?: number;
  };
}

export interface FundEntry {
  _id: string;
  date: string;
  description: string;
  amount: number;
  type: "in" | "out";
}

export interface PlayerPayment {
  player: {
    _id: string;
    name: string;
    jerseyNumber: number;
  };
  amountPaid: number;
}

export interface SeasonWithFund {
  _id: string;
  name: string;
  slug: string;
  teamFundTotal?: number;
  playerPayments?: PlayerPayment[];
}

// Calculated stats
export interface BattingStats {
  gamesPlayed: number;
  plateAppearances: number;
  atBats: number;
  hits: number;
  runs: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  stolenBases: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
}

export interface PitchingStats {
  gamesPlayed: number;
  inningsPitched: number;
  hitsAllowed: number;
  runsAllowed: number;
  earnedRuns: number;
  walksAllowed: number;
  strikeouts: number;
  era: number;
  whip: number;
}

export interface PlayerWithStats extends Player {
  batting?: BattingStats;
  pitching?: PitchingStats;
}
