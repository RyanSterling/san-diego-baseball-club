import type { PlayerGameEntry, GameWithStats, BattingStats } from "@/types/sanity";

// Chart data point for player batting average progression
export interface BattingProgressPoint {
  gameNumber: number;
  date: string;
  opponent: string;
  avg: number;
  hits: number;
  atBats: number;
  cumulativeHits: number;
  cumulativeAtBats: number;
}

// Chart data point for team runs per game
export interface TeamGamePoint {
  gameNumber: number;
  date: string;
  opponent: string;
  runsScored: number;
  runsAllowed: number;
  result: "W" | "L" | "T" | null;
}

// Leaderboard entry for bar chart
export interface LeaderboardEntry {
  name: string;
  slug: string;
  value: number;
  rank: number;
}

/**
 * Transform player game entries into chart data for batting average progression
 */
export function transformPlayerGamesToChartData(
  games: PlayerGameEntry[]
): BattingProgressPoint[] {
  let cumulativeHits = 0;
  let cumulativeAtBats = 0;

  return games
    .filter((g) => g.playerStat && g.playerStat.atBats > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((game, index) => {
      const stat = game.playerStat!;
      cumulativeHits += stat.hits;
      cumulativeAtBats += stat.atBats;

      return {
        gameNumber: index + 1,
        date: game.date,
        opponent: game.opponent,
        avg: cumulativeAtBats > 0 ? cumulativeHits / cumulativeAtBats : 0,
        hits: stat.hits,
        atBats: stat.atBats,
        cumulativeHits,
        cumulativeAtBats,
      };
    });
}

/**
 * Transform games into team scoring data
 */
export function transformGamesToTeamData(
  games: Array<{
    _id: string;
    date: string;
    opponent: string;
    result?: "W" | "L" | "T";
    ourScore?: number;
    theirScore?: number;
  }>
): TeamGamePoint[] {
  return games
    .filter((g) => g.ourScore !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((game, index) => ({
      gameNumber: index + 1,
      date: game.date,
      opponent: game.opponent,
      runsScored: game.ourScore ?? 0,
      runsAllowed: game.theirScore ?? 0,
      result: game.result ?? null,
    }));
}

/**
 * Transform player stats into leaderboard data
 */
export function transformToLeaderboardData(
  playerStats: Array<{
    player: { name: string; slug: string };
    batting: BattingStats;
  }>,
  stat: keyof BattingStats,
  limit = 5
): LeaderboardEntry[] {
  return playerStats
    .filter((p) => p.batting.atBats >= 1)
    .sort((a, b) => (b.batting[stat] as number) - (a.batting[stat] as number))
    .slice(0, limit)
    .map((p, index) => ({
      name: p.player.name,
      slug: p.player.slug,
      value: p.batting[stat] as number,
      rank: index + 1,
    }));
}

/**
 * Format batting average for display (e.g., .333)
 */
export function formatChartAvg(avg: number): string {
  if (avg >= 1) return "1.000";
  if (avg === 0) return ".000";
  return avg.toFixed(3).replace(/^0/, "");
}

/**
 * Format date for chart tooltip
 */
export function formatChartDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
