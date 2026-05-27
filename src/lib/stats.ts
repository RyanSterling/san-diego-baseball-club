import type { GameWithStats, PlayerStatLine, BattingStats, PitchingStats } from "@/types/sanity";

interface PlayerInfo {
  _id: string;
  name: string;
  slug: string;
  jerseyNumber: number;
  position?: string;
}

interface PlayerStatEntry {
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
}

/**
 * Calculate batting statistics from an array of game stat entries
 */
interface BattingTotals {
  gamesPlayed: number;
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
}

export function calculateBattingStats(statEntries: PlayerStatEntry[]): BattingStats {
  const totals = statEntries.reduce<BattingTotals>(
    (acc, game) => ({
      gamesPlayed: acc.gamesPlayed + 1,
      atBats: acc.atBats + (game.atBats || 0),
      hits: acc.hits + (game.hits || 0),
      runs: acc.runs + (game.runs || 0),
      rbi: acc.rbi + (game.rbi || 0),
      walks: acc.walks + (game.walks || 0),
      strikeouts: acc.strikeouts + (game.strikeouts || 0),
      doubles: acc.doubles + (game.doubles || 0),
      triples: acc.triples + (game.triples || 0),
      homeRuns: acc.homeRuns + (game.homeRuns || 0),
      stolenBases: acc.stolenBases + (game.stolenBases || 0),
    }),
    {
      gamesPlayed: 0,
      atBats: 0,
      hits: 0,
      runs: 0,
      rbi: 0,
      walks: 0,
      strikeouts: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      stolenBases: 0,
    }
  );

  // Calculate averages
  const singles = totals.hits - totals.doubles - totals.triples - totals.homeRuns;
  const totalBases =
    singles + totals.doubles * 2 + totals.triples * 3 + totals.homeRuns * 4;
  const plateAppearances = totals.atBats + totals.walks;

  const avg = totals.atBats > 0 ? totals.hits / totals.atBats : 0;
  const obp = plateAppearances > 0 ? (totals.hits + totals.walks) / plateAppearances : 0;
  const slg = totals.atBats > 0 ? totalBases / totals.atBats : 0;
  const ops = obp + slg;

  return {
    ...totals,
    avg: Math.round(avg * 1000) / 1000,
    obp: Math.round(obp * 1000) / 1000,
    slg: Math.round(slg * 1000) / 1000,
    ops: Math.round(ops * 1000) / 1000,
  };
}

interface PitchingTotals {
  gamesPlayed: number;
  inningsPitched: number;
  hitsAllowed: number;
  runsAllowed: number;
  earnedRuns: number;
  walksAllowed: number;
  strikeouts: number;
}

/**
 * Calculate pitching statistics from an array of game stat entries
 */
export function calculatePitchingStats(statEntries: PlayerStatEntry[]): PitchingStats {
  const pitchingGames = statEntries.filter((g) => g.inningsPitched && g.inningsPitched > 0);

  const totals = pitchingGames.reduce<PitchingTotals>(
    (acc, game) => ({
      gamesPlayed: acc.gamesPlayed + 1,
      inningsPitched: acc.inningsPitched + (game.inningsPitched || 0),
      hitsAllowed: acc.hitsAllowed + (game.hitsAllowed || 0),
      runsAllowed: acc.runsAllowed + (game.earnedRuns || 0), // Using earnedRuns for now
      earnedRuns: acc.earnedRuns + (game.earnedRuns || 0),
      walksAllowed: acc.walksAllowed + (game.pitchingWalks || 0),
      strikeouts: acc.strikeouts + (game.pitchingStrikeouts || 0),
    }),
    {
      gamesPlayed: 0,
      inningsPitched: 0,
      hitsAllowed: 0,
      runsAllowed: 0,
      earnedRuns: 0,
      walksAllowed: 0,
      strikeouts: 0,
    }
  );

  // ERA = (Earned Runs / Innings Pitched) * 9
  const era =
    totals.inningsPitched > 0
      ? (totals.earnedRuns / totals.inningsPitched) * 9
      : 0;

  // WHIP = (Walks + Hits) / Innings Pitched
  const whip =
    totals.inningsPitched > 0
      ? (totals.walksAllowed + totals.hitsAllowed) / totals.inningsPitched
      : 0;

  return {
    ...totals,
    era: Math.round(era * 100) / 100,
    whip: Math.round(whip * 100) / 100,
  };
}

/**
 * Format batting average for display (e.g., .333)
 */
export function formatAvg(avg: number): string {
  if (avg >= 1) return "1.000";
  return avg.toFixed(3).replace(/^0/, "");
}

/**
 * Format ERA for display
 */
export function formatEra(era: number): string {
  return era.toFixed(2);
}

/**
 * Format innings pitched (converts 5.1 to "5.1", 5.33 to "5.1")
 */
export function formatInnings(innings: number): string {
  const wholeInnings = Math.floor(innings);
  const partialInning = innings - wholeInnings;

  // Convert decimal to thirds (0.33 = 1, 0.67 = 2)
  let outs = 0;
  if (partialInning >= 0.6) outs = 2;
  else if (partialInning >= 0.3) outs = 1;

  return `${wholeInnings}.${outs}`;
}

/**
 * Extract and aggregate stats from games with embedded player stats
 */
export function aggregateStatsFromGames(
  games: GameWithStats[]
): Map<string, { player: PlayerInfo; stats: PlayerStatEntry[] }> {
  const playerMap = new Map<string, { player: PlayerInfo; stats: PlayerStatEntry[] }>();

  games.forEach((game) => {
    if (!game.playerStats) return;

    game.playerStats.forEach((stat) => {
      if (!stat.player) return;

      const playerId = stat.player._id;
      if (!playerMap.has(playerId)) {
        playerMap.set(playerId, {
          player: stat.player,
          stats: []
        });
      }

      playerMap.get(playerId)!.stats.push({
        atBats: stat.atBats || 0,
        hits: stat.hits || 0,
        runs: stat.runs || 0,
        rbi: stat.rbi || 0,
        walks: stat.walks || 0,
        strikeouts: stat.strikeouts || 0,
        doubles: stat.doubles || 0,
        triples: stat.triples || 0,
        homeRuns: stat.homeRuns || 0,
        stolenBases: stat.stolenBases || 0,
        inningsPitched: stat.inningsPitched,
        earnedRuns: stat.earnedRuns,
        pitchingStrikeouts: stat.pitchingStrikeouts,
        pitchingWalks: stat.pitchingWalks,
        hitsAllowed: stat.hitsAllowed,
      });
    });
  });

  return playerMap;
}

/**
 * Get batting leaders sorted by a specific stat
 */
export function getBattingLeaders(
  playerStats: Map<string, { player: PlayerInfo; stats: PlayerStatEntry[] }>,
  stat: keyof BattingStats,
  limit = 10
): Array<{ player: PlayerInfo; batting: BattingStats }> {
  return Array.from(playerStats.values())
    .map(({ player, stats }) => ({
      player,
      batting: calculateBattingStats(stats),
    }))
    .filter((p) => p.batting.atBats >= 1) // Minimum at-bats qualifier
    .sort((a, b) => (b.batting[stat] as number) - (a.batting[stat] as number))
    .slice(0, limit);
}

/**
 * Get pitching leaders sorted by a specific stat
 */
export function getPitchingLeaders(
  playerStats: Map<string, { player: PlayerInfo; stats: PlayerStatEntry[] }>,
  stat: keyof PitchingStats,
  limit = 10,
  ascending = false
): Array<{ player: PlayerInfo; pitching: PitchingStats }> {
  const leaders = Array.from(playerStats.values())
    .map(({ player, stats }) => ({
      player,
      pitching: calculatePitchingStats(stats),
    }))
    .filter((p) => p.pitching.inningsPitched >= 1); // Minimum innings qualifier

  if (ascending) {
    // For stats like ERA where lower is better
    return leaders
      .sort((a, b) => (a.pitching[stat] as number) - (b.pitching[stat] as number))
      .slice(0, limit);
  }

  return leaders
    .sort((a, b) => (b.pitching[stat] as number) - (a.pitching[stat] as number))
    .slice(0, limit);
}
