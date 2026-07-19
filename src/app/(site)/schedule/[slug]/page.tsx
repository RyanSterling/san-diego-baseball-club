import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/lib/sanity/client";
import { gameBySlugQuery } from "@/lib/sanity/queries";
import type { Game } from "@/types/sanity";
import { PortableText } from "@portabletext/react";
import Badge from "@/components/ui/Badge";
import TwoToneTitle from "@/components/ui/TwoToneTitle";
import BoxScore from "@/components/schedule/BoxScore";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getGameData(slug: string) {
  const game = await client.fetch<Game | null>(gameBySlugQuery, { slug });
  return { game };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { game } = await getGameData(slug);

  if (!game) {
    notFound();
  }

  const hasResult = game.result && game.ourScore !== undefined && game.theirScore !== undefined;
  const playerStats = game.playerStats || [];

  // Calculate team hits from player stats if not manually set
  const calculatedOurHits = playerStats.reduce((sum, stat) => sum + (stat.hits || 0), 0);
  const gameWithHits = {
    ...game,
    ourHits: game.ourHits ?? (playerStats.length > 0 ? calculatedOurHits : undefined),
  };

  return (
    <div>
      {/* Hero Header with Gradient */}
      <div className="relative bg-gradient-to-r from-dark via-dark to-teal/30 overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_var(--color-teal)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_var(--color-orange)_0%,_transparent_50%)]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back link */}
          <Link
            href="/#schedule"
            className="inline-flex items-center text-white/60 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Schedule
          </Link>

          {/* Matchup */}
          <div className="flex items-center justify-between py-8">
            {/* Our Team */}
            <div className="flex-1 flex flex-col items-center">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mb-3">
                <span className="font-headline text-3xl md:text-4xl text-white">SD</span>
              </div>
              <p className="font-headline text-sm md:text-base uppercase tracking-wide text-white/70">
                San Diego
              </p>
            </div>

            {/* Score */}
            <div className="flex-1 flex flex-col items-center">
              {hasResult ? (
                <>
                  <Badge
                    variant={game.result === "W" ? "win" : game.result === "L" ? "loss" : "tie"}
                    size="md"
                  >
                    {game.result === "W" ? "Final" : game.result === "L" ? "Final" : "Final"}
                  </Badge>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="font-headline text-5xl md:text-6xl text-white">{game.ourScore}</span>
                    <span className="font-headline text-2xl text-white/40">-</span>
                    <span className="font-headline text-5xl md:text-6xl text-white/60">{game.theirScore}</span>
                  </div>
                </>
              ) : (
                <>
                  <Badge variant="teal" size="md">Upcoming</Badge>
                  <p className="font-headline text-2xl text-white mt-3">{formatTime(game.date)}</p>
                </>
              )}
              <p className="text-white/50 text-sm mt-2">{formatDate(game.date)}</p>
            </div>

            {/* Opponent */}
            <div className="flex-1 flex flex-col items-center">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mb-3">
                <span className="font-headline text-2xl md:text-3xl text-white/70 text-center px-2 leading-tight">
                  {game.opponent.substring(0, 3).toUpperCase()}
                </span>
              </div>
              <p className="font-headline text-sm md:text-base uppercase tracking-wide text-white/70 text-center">
                {game.opponent}
              </p>
            </div>
          </div>

          {/* Location bar */}
          <div className="flex items-center justify-center gap-4 text-white/50 text-sm pb-4">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {game.location}
            </span>
            <span>•</span>
            <span>{game.homeOrAway === "home" ? "Home" : "Away"}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Inning-by-Inning Box Score */}
          {hasResult && <BoxScore game={gameWithHits} />}

          {/* Game Recap */}
          {game.recap && game.recap.length > 0 && (
            <div className="bg-white/5 border border-white/10 p-6">
              <TwoToneTitle prefix="Game" highlight="Recap" accentColor="orange" size="md" dark />
              <div className="prose prose-invert max-w-none mt-4 text-white/80">
                <PortableText value={game.recap} />
              </div>
            </div>
          )}

          {/* Player Stats */}
          {playerStats.length > 0 && (
            <div className="bg-white/5 border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <TwoToneTitle prefix="Player" highlight="Stats" accentColor="teal" size="md" dark />
              </div>

              {/* Batting */}
              <div className="p-6">
                <h3 className="font-headline text-sm uppercase tracking-wide text-white/60 mb-3">Batting</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-white/10">
                        <th className="text-left py-2 px-3 font-headline text-xs uppercase tracking-wide text-white/70">Player</th>
                        <th className="text-center py-2 px-2 font-headline text-xs uppercase tracking-wide text-white/70">AB</th>
                        <th className="text-center py-2 px-2 font-headline text-xs uppercase tracking-wide text-white/70">H</th>
                        <th className="text-center py-2 px-2 font-headline text-xs uppercase tracking-wide text-white/70">R</th>
                        <th className="text-center py-2 px-2 font-headline text-xs uppercase tracking-wide text-white/70">RBI</th>
                        <th className="text-center py-2 px-2 font-headline text-xs uppercase tracking-wide text-white/70">BB</th>
                        <th className="text-center py-2 px-2 font-headline text-xs uppercase tracking-wide text-white/70">K</th>
                        <th className="text-center py-2 px-2 font-headline text-xs uppercase tracking-wide text-white/70">HR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {playerStats.map((stat, index) => (
                        <tr
                          key={index}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="py-2 px-3">
                            <Link href={`/roster/${stat.player.slug}`} className="group">
                              <span className="!text-white/50">#{stat.player.jerseyNumber}</span>{" "}
                              <span className="!text-white group-hover:!text-teal transition-colors">{stat.player.name}</span>
                            </Link>
                          </td>
                          <td className="text-center py-2 px-2 text-white/70">{stat.atBats || 0}</td>
                          <td className="text-center py-2 px-2 text-white/70">{stat.hits || 0}</td>
                          <td className="text-center py-2 px-2 text-white/70">{stat.runs || 0}</td>
                          <td className="text-center py-2 px-2 text-white/70">{stat.rbi || 0}</td>
                          <td className="text-center py-2 px-2 text-white/70">{stat.walks || 0}</td>
                          <td className="text-center py-2 px-2 text-white/70">{stat.strikeouts || 0}</td>
                          <td className="text-center py-2 px-2 text-white/70">{stat.homeRuns || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pitching */}
              {playerStats.some((s) => s.inningsPitched != null) && (
                <div className="p-6 pt-0">
                  <h3 className="font-headline text-sm uppercase tracking-wide text-white/60 mb-3">Pitching</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-white/10">
                          <th className="text-left py-2 px-3 font-headline text-xs uppercase tracking-wide text-white/70">Player</th>
                          <th className="text-center py-2 px-2 font-headline text-xs uppercase tracking-wide text-white/70">IP</th>
                          <th className="text-center py-2 px-2 font-headline text-xs uppercase tracking-wide text-white/70">H</th>
                          <th className="text-center py-2 px-2 font-headline text-xs uppercase tracking-wide text-white/70">ER</th>
                          <th className="text-center py-2 px-2 font-headline text-xs uppercase tracking-wide text-white/70">BB</th>
                          <th className="text-center py-2 px-2 font-headline text-xs uppercase tracking-wide text-white/70">K</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {playerStats
                          .filter((s) => s.inningsPitched != null)
                          .map((stat, index) => (
                            <tr
                              key={index}
                              className="hover:bg-white/5 transition-colors"
                            >
                              <td className="py-2 px-3">
                                <Link href={`/roster/${stat.player.slug}`} className="group">
                                  <span className="!text-white/50">#{stat.player.jerseyNumber}</span>{" "}
                                  <span className="!text-white group-hover:!text-teal transition-colors">{stat.player.name}</span>
                                </Link>
                              </td>
                              <td className="text-center py-2 px-2 text-white/70">{stat.inningsPitched}</td>
                              <td className="text-center py-2 px-2 text-white/70">{stat.hitsAllowed || 0}</td>
                              <td className="text-center py-2 px-2 text-white/70">{stat.earnedRuns || 0}</td>
                              <td className="text-center py-2 px-2 text-white/70">{stat.pitchingWalks || 0}</td>
                              <td className="text-center py-2 px-2 text-white/70">{stat.pitchingStrikeouts || 0}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
