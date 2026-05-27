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
      {/* Back Link */}
      <div className="bg-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link
            href="/#roster"
            className="inline-flex items-center text-white/60 hover:text-teal transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Roster
          </Link>
        </div>
      </div>

      {/* Hero Section - Card Style */}
      <section className="bg-dark text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative flex bg-[#2d2d2d] overflow-hidden h-44">
            {/* Left Content */}
            <div className="flex-1 p-6 flex flex-col z-10">
              {/* Jersey Number Box */}
              <div className="w-10 h-10 border-2 border-white/80 flex items-center justify-center">
                <span className="font-headline text-lg text-white">{player.jerseyNumber}</span>
              </div>

              {/* Name & Position */}
              <div className="mt-4">
                <h1 className="font-headline text-2xl sm:text-3xl uppercase tracking-tight text-white">
                  {player.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-white/50">{player.position}</span>
                  {btDisplay && (
                    <>
                      <span className="text-white/30">|</span>
                      <span className="text-white/50">B/T: {btDisplay}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Orange Circle Background - only show for players with photos */}
            {player.photo && (
              <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-80 h-80 bg-orange rounded-full" />
            )}

            {/* Player Photo or Placeholder */}
            {player.photo ? (
              <div className="absolute right-0 top-0 bottom-0 w-44 z-10">
                <Image
                  src={urlFor(player.photo).width(352).height(352).url()}
                  alt={player.name}
                  fill
                  className="object-cover object-top"
                />
              </div>
            ) : (
              <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10">
                <svg className="w-20 h-20 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Bio - outside the card */}
          {player.bio && (
            <p className="mt-4 text-white/60 text-sm max-w-xl">{player.bio}</p>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-dark text-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-2xl uppercase tracking-tight mb-6">
            <span className="text-white/50">2026</span> Season
          </h2>

          {gamesWithStats.length === 0 ? (
            <p className="text-white/50">No stats recorded for this season.</p>
          ) : (
            <div className="space-y-8">
              {/* Batting Stats Table */}
              <div className="bg-white/5 border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="text-left px-4 py-3 font-headline uppercase text-xs tracking-wide text-white/70">Season</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">G</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">AB</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">R</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">H</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70 hidden sm:table-cell">2B</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70 hidden sm:table-cell">3B</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">HR</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">RBI</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70 hidden md:table-cell">BB</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70 hidden md:table-cell">SO</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70 hidden lg:table-cell">SB</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">AVG</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70 hidden lg:table-cell">OBP</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70 hidden lg:table-cell">SLG</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70 hidden xl:table-cell">OPS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-3 font-medium text-white">2026</td>
                        <td className="text-center px-2 py-3 text-white/70">{battingStats.gamesPlayed}</td>
                        <td className="text-center px-2 py-3 text-white/70">{battingStats.atBats}</td>
                        <td className="text-center px-2 py-3 text-white/70">{battingStats.runs}</td>
                        <td className="text-center px-2 py-3 text-white/70">{battingStats.hits}</td>
                        <td className="text-center px-2 py-3 text-white/70 hidden sm:table-cell">{battingStats.doubles}</td>
                        <td className="text-center px-2 py-3 text-white/70 hidden sm:table-cell">{battingStats.triples}</td>
                        <td className="text-center px-2 py-3 text-white/70">{battingStats.homeRuns}</td>
                        <td className="text-center px-2 py-3 text-white/70">{battingStats.rbi}</td>
                        <td className="text-center px-2 py-3 text-white/70 hidden md:table-cell">{battingStats.walks}</td>
                        <td className="text-center px-2 py-3 text-white/70 hidden md:table-cell">{battingStats.strikeouts}</td>
                        <td className="text-center px-2 py-3 text-white/70 hidden lg:table-cell">{battingStats.stolenBases}</td>
                        <td className="text-center px-2 py-3 font-medium text-white">
                          {battingStats.atBats > 0 ? formatAvg(battingStats.avg) : "-"}
                        </td>
                        <td className="text-center px-2 py-3 text-white/70 hidden lg:table-cell">
                          {battingStats.atBats > 0 ? formatAvg(battingStats.obp) : "-"}
                        </td>
                        <td className="text-center px-2 py-3 text-white/70 hidden lg:table-cell">
                          {battingStats.atBats > 0 ? formatAvg(battingStats.slg) : "-"}
                        </td>
                        <td className="text-center px-2 py-3 text-white/70 hidden xl:table-cell">
                          {battingStats.atBats > 0 ? formatAvg(battingStats.ops) : "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Batting Average Progression Chart */}
              {chartData.length >= 3 && (
                <div>
                  <PlayerProgressChart data={chartData} playerName={player.name} />
                </div>
              )}

              {/* Pitching Stats */}
              {hasPitchingStats && (
                <div className="bg-white/5 border border-white/10 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10">
                    <h3 className="font-headline text-lg uppercase tracking-tight text-white">Pitching</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="text-left px-4 py-3 font-headline uppercase text-xs tracking-wide text-white/70">Season</th>
                          <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">G</th>
                          <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">IP</th>
                          <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">H</th>
                          <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">ER</th>
                          <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">BB</th>
                          <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">K</th>
                          <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">ERA</th>
                          <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">WHIP</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-3 font-medium text-white">2026</td>
                          <td className="text-center px-2 py-3 text-white/70">{pitchingStats.gamesPlayed}</td>
                          <td className="text-center px-2 py-3 text-white/70">{pitchingStats.inningsPitched.toFixed(1)}</td>
                          <td className="text-center px-2 py-3 text-white/70">{pitchingStats.hitsAllowed}</td>
                          <td className="text-center px-2 py-3 text-white/70">{pitchingStats.earnedRuns}</td>
                          <td className="text-center px-2 py-3 text-white/70">{pitchingStats.walksAllowed}</td>
                          <td className="text-center px-2 py-3 text-white/70">{pitchingStats.strikeouts}</td>
                          <td className="text-center px-2 py-3 font-medium text-white">{formatEra(pitchingStats.era)}</td>
                          <td className="text-center px-2 py-3 text-white/70">{pitchingStats.whip.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Game Log */}
              <div className="bg-white/5 border border-white/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <h3 className="font-headline text-lg uppercase tracking-tight text-white">Game Log</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="text-left px-4 py-3 font-headline uppercase text-xs tracking-wide text-white/70">Date</th>
                        <th className="text-left px-4 py-3 font-headline uppercase text-xs tracking-wide text-white/70">Opponent</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">AB</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">H</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">R</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70">RBI</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70 hidden sm:table-cell">HR</th>
                        <th className="text-center px-2 py-3 font-headline uppercase text-xs tracking-wide text-white/70 hidden sm:table-cell">BB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {gamesWithStats.map((game, index) => {
                        const stat = game.playerStat!;
                        return (
                          <tr key={index} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-white">
                              {new Date(game.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <Link
                                href={`/schedule/${game.slug}`}
                                className="text-white hover:text-teal transition-colors"
                              >
                                {game.opponent}
                              </Link>
                            </td>
                            <td className="text-center px-2 py-3 text-white/70">{stat.atBats || 0}</td>
                            <td className="text-center px-2 py-3 text-white/70">{stat.hits || 0}</td>
                            <td className="text-center px-2 py-3 text-white/70">{stat.runs || 0}</td>
                            <td className="text-center px-2 py-3 text-white/70">{stat.rbi || 0}</td>
                            <td className="text-center px-2 py-3 text-white/70 hidden sm:table-cell">{stat.homeRuns || 0}</td>
                            <td className="text-center px-2 py-3 text-white/70 hidden sm:table-cell">{stat.walks || 0}</td>
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
