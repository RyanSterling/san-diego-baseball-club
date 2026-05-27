import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { client } from "@/lib/sanity/client";
import {
  playerBySlugQuery,
  currentSeasonQuery,
  playerSeasonGamesBySlugQuery,
} from "@/lib/sanity/queries";
import type { Player, Season, PlayerGameEntry } from "@/types/sanity";
import { urlFor } from "@/lib/sanity/image";
import { calculateBattingStats, calculatePitchingStats, formatAvg, formatEra } from "@/lib/stats";
import { PlayerProgressChart } from "@/components/stats/charts";
import { transformPlayerGamesToChartData } from "@/lib/stats/chartHelpers";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string }>;
}

async function getSeasonSlug(seasonParam?: string): Promise<string | null> {
  if (seasonParam) {
    return seasonParam;
  }
  const currentSeason = await client.fetch<Season | null>(currentSeasonQuery);
  return currentSeason?.slug || null;
}

async function getPlayerData(slug: string, seasonSlug: string | null) {
  const player = await client.fetch<Player | null>(playerBySlugQuery, { slug });

  if (!player) return { player: null, gameEntries: [] };

  let gameEntries: PlayerGameEntry[] = [];

  if (seasonSlug) {
    gameEntries = await client.fetch<PlayerGameEntry[]>(playerSeasonGamesBySlugQuery, {
      playerId: player._id,
      seasonSlug,
    });
  }

  return { player, gameEntries };
}

export default async function PlayerDetailPage({ params, searchParams }: PageProps) {
  const [{ slug }, searchParamsResolved] = await Promise.all([params, searchParams]);
  const seasonSlug = await getSeasonSlug(searchParamsResolved.season);
  const { player, gameEntries } = await getPlayerData(slug, seasonSlug);

  if (!player) {
    notFound();
  }

  // Filter to only games where the player has stats
  const gamesWithStats = gameEntries.filter(g => g.playerStat);
  const statEntries = gamesWithStats.map(g => g.playerStat!);

  const battingStats = calculateBattingStats(statEntries);
  const pitchingStats = calculatePitchingStats(statEntries);
  const hasPitchingStats = pitchingStats.inningsPitched > 0;

  // Prepare chart data
  const chartData = transformPlayerGamesToChartData(gameEntries);

  // Format B/T display
  const btDisplay = player.battingSide && player.throwingSide
    ? `${player.battingSide === "S" ? "S" : player.battingSide}/${player.throwingSide}`
    : null;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-dark text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/#roster"
            className="inline-flex items-center text-white/60 hover:text-teal transition-colors text-sm mb-6"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Roster
          </Link>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Player Photo */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-dark/50 border-2 border-teal flex-shrink-0 relative overflow-hidden">
              {player.photo ? (
                <Image
                  src={urlFor(player.photo).width(320).height(320).url()}
                  alt={player.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/20">
                  <span className="font-headline text-5xl">#{player.jerseyNumber}</span>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1">
              <h1 className="font-headline text-3xl sm:text-4xl uppercase tracking-tight">
                {player.name}{" "}
                <span className="text-teal">#{player.jerseyNumber}</span>
              </h1>

              {/* Info Bar */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-white/70">
                <span className="font-headline text-lg uppercase text-teal">{player.position}</span>
                {btDisplay && (
                  <>
                    <span className="text-white/30">|</span>
                    <span>B/T: {btDisplay}</span>
                  </>
                )}
              </div>

              {player.bio && (
                <p className="mt-4 text-white/60 text-sm max-w-xl">{player.bio}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-cream py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-2xl uppercase tracking-tight text-dark mb-6">
            <span className="text-dark/50">2026</span> Season
          </h2>

          {gamesWithStats.length === 0 ? (
            <p className="text-dark/50">No stats recorded for this season.</p>
          ) : (
            <div className="space-y-8">
              {/* Batting Stats Table */}
              <div className="bg-white border border-dark/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="stats-table">
                    <thead className="bg-dark text-white">
                      <tr>
                        <th className="!text-white !border-b-0 text-left">Season</th>
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
                    <tbody>
                      <tr>
                        <td className="font-medium">2026</td>
                        <td className="stat-col">{battingStats.gamesPlayed}</td>
                        <td className="stat-col">{battingStats.atBats}</td>
                        <td className="stat-col">{battingStats.runs}</td>
                        <td className="stat-col">{battingStats.hits}</td>
                        <td className="stat-col hidden sm:table-cell">{battingStats.doubles}</td>
                        <td className="stat-col hidden sm:table-cell">{battingStats.triples}</td>
                        <td className="stat-col">
                          {battingStats.homeRuns > 0 ? (
                            <span className="highlight-stat">{battingStats.homeRuns}</span>
                          ) : (
                            "0"
                          )}
                        </td>
                        <td className="stat-col">{battingStats.rbi}</td>
                        <td className="stat-col hidden md:table-cell">{battingStats.walks}</td>
                        <td className="stat-col hidden md:table-cell">{battingStats.strikeouts}</td>
                        <td className="stat-col hidden lg:table-cell">{battingStats.stolenBases}</td>
                        <td className="stat-col font-medium">
                          {battingStats.atBats > 0 ? formatAvg(battingStats.avg) : "-"}
                        </td>
                        <td className="stat-col hidden lg:table-cell">
                          {battingStats.atBats > 0 ? formatAvg(battingStats.obp) : "-"}
                        </td>
                        <td className="stat-col hidden lg:table-cell">
                          {battingStats.atBats > 0 ? formatAvg(battingStats.slg) : "-"}
                        </td>
                        <td className="stat-col hidden xl:table-cell">
                          {battingStats.atBats > 0 ? formatAvg(battingStats.ops) : "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Batting Average Progression Chart */}
              {chartData.length >= 3 && (
                <div className="bg-dark">
                  <PlayerProgressChart data={chartData} playerName={player.name} />
                </div>
              )}

              {/* Pitching Stats */}
              {hasPitchingStats && (
                <div className="bg-white border border-dark/10 overflow-hidden">
                  <div className="px-4 py-3 border-b border-dark/10">
                    <h3 className="font-headline text-lg uppercase tracking-tight text-dark">Pitching</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="stats-table">
                      <thead className="bg-dark text-white">
                        <tr>
                          <th className="!text-white !border-b-0 text-left">Season</th>
                          <th className="!text-white !border-b-0 stat-col">G</th>
                          <th className="!text-white !border-b-0 stat-col">IP</th>
                          <th className="!text-white !border-b-0 stat-col">H</th>
                          <th className="!text-white !border-b-0 stat-col">ER</th>
                          <th className="!text-white !border-b-0 stat-col">BB</th>
                          <th className="!text-white !border-b-0 stat-col">K</th>
                          <th className="!text-white !border-b-0 stat-col">ERA</th>
                          <th className="!text-white !border-b-0 stat-col">WHIP</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="font-medium">2026</td>
                          <td className="stat-col">{pitchingStats.gamesPlayed}</td>
                          <td className="stat-col">{pitchingStats.inningsPitched.toFixed(1)}</td>
                          <td className="stat-col">{pitchingStats.hitsAllowed}</td>
                          <td className="stat-col">{pitchingStats.earnedRuns}</td>
                          <td className="stat-col">{pitchingStats.walksAllowed}</td>
                          <td className="stat-col">{pitchingStats.strikeouts}</td>
                          <td className="stat-col font-medium">{formatEra(pitchingStats.era)}</td>
                          <td className="stat-col">{pitchingStats.whip.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Game Log */}
              <div className="bg-white border border-dark/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-dark/10">
                  <h3 className="font-headline text-lg uppercase tracking-tight text-dark">Game Log</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="stats-table">
                    <thead className="bg-dark/5">
                      <tr>
                        <th className="text-left">Date</th>
                        <th className="text-left">Opponent</th>
                        <th className="stat-col">AB</th>
                        <th className="stat-col">H</th>
                        <th className="stat-col">R</th>
                        <th className="stat-col">RBI</th>
                        <th className="stat-col hidden sm:table-cell">HR</th>
                        <th className="stat-col hidden sm:table-cell">BB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gamesWithStats.map((game, index) => {
                        const stat = game.playerStat!;
                        return (
                          <tr key={index} className={index % 2 === 1 ? "bg-dark/[0.02]" : ""}>
                            <td className="whitespace-nowrap">
                              {new Date(game.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td>
                              <Link
                                href={`/schedule/${game.slug}`}
                                className="hover:text-orange transition-colors"
                              >
                                {game.opponent}
                              </Link>
                            </td>
                            <td className="stat-col">{stat.atBats || 0}</td>
                            <td className="stat-col">{stat.hits || 0}</td>
                            <td className="stat-col">{stat.runs || 0}</td>
                            <td className="stat-col">{stat.rbi || 0}</td>
                            <td className="stat-col hidden sm:table-cell">
                              {stat.homeRuns ? (
                                <span className="highlight-stat">{stat.homeRuns}</span>
                              ) : (
                                "0"
                              )}
                            </td>
                            <td className="stat-col hidden sm:table-cell">{stat.walks || 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
