import Link from "next/link";
import { client } from "@/lib/sanity/client";
import {
  currentSeasonQuery,
  gamesWithStatsBySeasonSlugQuery,
  gameScoresBySeasonSlugQuery,
} from "@/lib/sanity/queries";
import type { Season, GameWithStats } from "@/types/sanity";
import {
  aggregateStatsFromGames,
  calculateBattingStats,
  formatAvg,
} from "@/lib/stats";
import { LeaderboardBarChart, TeamRunsChart } from "@/components/stats/charts";
import {
  transformToLeaderboardData,
  transformGamesToTeamData,
} from "@/lib/stats/chartHelpers";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ season?: string }>;
}

async function getSeasonSlug(seasonParam?: string): Promise<string | null> {
  if (seasonParam) {
    return seasonParam;
  }
  const currentSeason = await client.fetch<Season | null>(currentSeasonQuery);
  return currentSeason?.slug || null;
}

interface GameScore {
  _id: string;
  date: string;
  opponent: string;
  result?: "W" | "L" | "T";
  ourScore?: number;
  theirScore?: number;
}

async function getStatsData(seasonSlug: string | null) {
  if (!seasonSlug) {
    return { games: [], gameScores: [] };
  }

  const [games, gameScores] = await Promise.all([
    client.fetch<GameWithStats[]>(gamesWithStatsBySeasonSlugQuery, {
      seasonSlug,
    }),
    client.fetch<GameScore[]>(gameScoresBySeasonSlugQuery, {
      seasonSlug,
    }),
  ]);

  return { games, gameScores };
}

export default async function StatsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const seasonSlug = await getSeasonSlug(params.season);
  const { games, gameScores } = await getStatsData(seasonSlug);

  const playerStatsMap = aggregateStatsFromGames(games);

  // Build player stats array with calculated batting stats
  const playerStats = Array.from(playerStatsMap.values())
    .map(({ player, stats }) => ({
      player,
      batting: calculateBattingStats(stats),
    }))
    .sort((a, b) => {
      // Sort by AVG descending for players with at-bats, then by games played
      if (a.batting.atBats > 0 && b.batting.atBats > 0) {
        return b.batting.avg - a.batting.avg;
      }
      if (a.batting.atBats > 0) return -1;
      if (b.batting.atBats > 0) return 1;
      return b.batting.gamesPlayed - a.batting.gamesPlayed;
    });

  const hasStats = playerStats.length > 0;

  // Prepare chart data
  const leaderboardData = transformToLeaderboardData(playerStats, "avg", 5);
  const teamRunsData = transformGamesToTeamData(gameScores);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl uppercase tracking-tight text-white mb-8">
        <span className="text-white/50">2026</span> Stats
      </h1>

      {/* Charts Section */}
      {hasStats && (leaderboardData.length > 0 || teamRunsData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {leaderboardData.length > 0 && (
            <LeaderboardBarChart
              data={leaderboardData}
              title="Batting Average Leaders"
              subtitle="Top 5 by AVG"
            />
          )}
          {teamRunsData.length > 0 && (
            <TeamRunsChart
              data={teamRunsData}
              title="Runs Per Game"
              subtitle="Win/Loss by color"
            />
          )}
        </div>
      )}

      {!hasStats ? (
        <p className="text-white/50">No stats recorded for this season yet.</p>
      ) : (
        <div className="bg-white/5 border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="stats-table stats-table-dark">
              <thead className="bg-white/10">
                <tr>
                  <th className="!text-white !border-b-0 text-left">Player</th>
                  <th className="!text-white !border-b-0 stat-col">G</th>
                  <th className="!text-white !border-b-0 stat-col">AB</th>
                  <th className="!text-white !border-b-0 stat-col">R</th>
                  <th className="!text-white !border-b-0 stat-col">H</th>
                  <th className="!text-white !border-b-0 stat-col hidden sm:table-cell">2B</th>
                  <th className="!text-white !border-b-0 stat-col hidden sm:table-cell">3B</th>
                  <th className="!text-white !border-b-0 stat-col">HR</th>
                  <th className="!text-white !border-b-0 stat-col">RBI</th>
                  <th className="!text-white !border-b-0 stat-col hidden md:table-cell">BB</th>
                  <th className="!text-white !border-b-0 stat-col hidden md:table-cell">SO</th>
                  <th className="!text-white !border-b-0 stat-col hidden lg:table-cell">SB</th>
                  <th className="!text-white !border-b-0 stat-col">AVG</th>
                  <th className="!text-white !border-b-0 stat-col hidden lg:table-cell">OBP</th>
                  <th className="!text-white !border-b-0 stat-col hidden lg:table-cell">SLG</th>
                  <th className="!text-white !border-b-0 stat-col hidden xl:table-cell">OPS</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {playerStats.map(({ player, batting }, index) => (
                  <tr key={player._id} className={index % 2 === 1 ? "bg-white/5" : ""}>
                    <td>
                      <Link
                        href={`/roster/${player.slug}`}
                        className="flex items-center gap-2 text-white hover:text-teal transition-colors"
                      >
                        <span className="text-white/40 text-sm w-5">{index + 1}</span>
                        <span className="player-name">{player.name}</span>
                        {player.position && (
                          <span className="text-white/40 text-xs uppercase">{player.position}</span>
                        )}
                      </Link>
                    </td>
                    <td className="stat-col">{batting.gamesPlayed}</td>
                    <td className="stat-col">{batting.atBats}</td>
                    <td className="stat-col">{batting.runs}</td>
                    <td className="stat-col">{batting.hits}</td>
                    <td className="stat-col hidden sm:table-cell">{batting.doubles}</td>
                    <td className="stat-col hidden sm:table-cell">{batting.triples}</td>
                    <td className="stat-col">
                      {batting.homeRuns > 0 ? (
                        <span className="text-orange font-medium">{batting.homeRuns}</span>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td className="stat-col">{batting.rbi}</td>
                    <td className="stat-col hidden md:table-cell">{batting.walks}</td>
                    <td className="stat-col hidden md:table-cell">{batting.strikeouts}</td>
                    <td className="stat-col hidden lg:table-cell">{batting.stolenBases}</td>
                    <td className="stat-col font-medium text-teal">
                      {batting.atBats > 0 ? formatAvg(batting.avg) : "-"}
                    </td>
                    <td className="stat-col hidden lg:table-cell">
                      {batting.atBats > 0 ? formatAvg(batting.obp) : "-"}
                    </td>
                    <td className="stat-col hidden lg:table-cell">
                      {batting.atBats > 0 ? formatAvg(batting.slg) : "-"}
                    </td>
                    <td className="stat-col hidden xl:table-cell">
                      {batting.atBats > 0 ? formatAvg(batting.ops) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
