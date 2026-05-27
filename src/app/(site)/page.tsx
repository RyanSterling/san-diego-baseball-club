import Link from "next/link";
import Image from "next/image";
import { client } from "@/lib/sanity/client";
import {
  siteSettingsQuery,
  currentSeasonQuery,
  allSeasonsQuery,
  playersBySeasonSlugQuery,
  gamesBySeasonSlugQuery,
  gamesWithStatsBySeasonSlugQuery,
} from "@/lib/sanity/queries";
import type { SiteSettings, Season, Player, Game, GameWithStats } from "@/types/sanity";
import { aggregateStatsFromGames, calculateBattingStats } from "@/lib/stats";
import { urlFor } from "@/lib/sanity/image";
import ContactForm from "@/components/contact/ContactForm";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ season?: string }>;
}

async function getSeasonSlug(seasonParam?: string): Promise<string | null> {
  if (seasonParam) {
    return seasonParam;
  }
  // Default to current season
  const currentSeason = await client.fetch<Season | null>(currentSeasonQuery);
  return currentSeason?.slug || null;
}

async function getHomeData(seasonSlug: string | null) {
  const [settings, seasons] = await Promise.all([
    client.fetch<SiteSettings | null>(siteSettingsQuery),
    client.fetch<Season[]>(allSeasonsQuery),
  ]);

  // Find the selected season for display
  const selectedSeason = seasons.find((s) => s.slug === seasonSlug) || seasons.find((s) => s.isCurrent) || seasons[0];

  // Get season-specific data (players, games, stats)
  const [players, games, gamesWithStats] = seasonSlug
    ? await Promise.all([
        client.fetch<Player[]>(playersBySeasonSlugQuery, { seasonSlug }),
        client.fetch<Game[]>(gamesBySeasonSlugQuery, { seasonSlug }),
        client.fetch<GameWithStats[]>(gamesWithStatsBySeasonSlugQuery, { seasonSlug }),
      ])
    : [[], [], []];

  // Calculate stats for each player
  const playerStatsMap = aggregateStatsFromGames(gamesWithStats);

  // Build roster with stats
  const rosterWithStats = players.map((player) => {
    const statsEntry = playerStatsMap.get(player._id);
    const batting = statsEntry ? calculateBattingStats(statsEntry.stats) : null;
    return { ...player, batting };
  });

  return { settings, selectedSeason, rosterWithStats, games };
}

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(date: string) {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const seasonSlug = await getSeasonSlug(params.season);
  const { settings, selectedSeason, rosterWithStats, games } = await getHomeData(seasonSlug);

  // Split games into upcoming and past
  const now = new Date();
  const upcomingGames = games.filter((g) => new Date(g.date) >= now);
  const pastGames = games.filter((g) => new Date(g.date) < now).reverse();

  return (
    <div>
      {/* Hero */}
      <section className="relative text-white py-12 md:py-16 overflow-hidden">
        {/* Background Image */}
        <Image
          src="/hero-background.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-dark/80" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 md:w-56 md:h-56 relative">
              <Image
                src="/SDBC_LOGO.png"
                alt={settings?.teamName || "San Diego Baseball Club"}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-12 bg-dark text-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-3xl uppercase tracking-tight mb-6">
            <span className="text-white/50">2026</span> Schedule
          </h2>

          <div className="bg-white/5 border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left px-4 py-3 font-headline uppercase text-xs tracking-wide text-white/70">Date</th>
                    <th className="text-left px-4 py-3 font-headline uppercase text-xs tracking-wide text-white/70">Opponent</th>
                    <th className="text-left px-4 py-3 font-headline uppercase text-xs tracking-wide text-white/70 hidden sm:table-cell">Location</th>
                    <th className="text-center px-4 py-3 font-headline uppercase text-xs tracking-wide text-white/70">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {/* Upcoming Games */}
                  {upcomingGames.slice(0, 5).map((game) => (
                    <tr key={game._id} className="hover:bg-white/5 transition-colors group relative">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link href={`/schedule/${game.slug}`} className="absolute inset-0 z-10" />
                        <div className="font-medium text-white">{formatDate(game.date)}</div>
                        <div className="text-white/50 text-sm">{formatTime(game.date)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-headline uppercase px-1.5 py-0.5 ${
                            game.homeOrAway === "home"
                              ? "bg-teal text-dark"
                              : "bg-white/10 text-teal"
                          }`}>
                            {game.homeOrAway === "home" ? "vs" : "@"}
                          </span>
                          <span className="font-medium text-white">{game.opponent}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/60 hidden sm:table-cell">{game.location}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white/40 text-sm">Upcoming</span>
                      </td>
                    </tr>
                  ))}

                  {/* Past Games */}
                  {pastGames.slice(0, upcomingGames.length > 0 ? 3 : 8).map((game) => (
                    <tr key={game._id} className="hover:bg-white/5 transition-colors group relative">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link href={`/schedule/${game.slug}`} className="absolute inset-0 z-10" />
                        <div className="font-medium text-white/70">{formatDate(game.date)}</div>
                        <div className="text-white/40 text-sm">{formatTime(game.date)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-headline uppercase px-1.5 py-0.5 ${
                            game.homeOrAway === "home"
                              ? "bg-teal text-dark"
                              : "bg-white/10 text-teal"
                          }`}>
                            {game.homeOrAway === "home" ? "vs" : "@"}
                          </span>
                          <span className="font-medium text-white/70">{game.opponent}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/40 hidden sm:table-cell">{game.location}</td>
                      <td className="px-4 py-3 text-center">
                        {game.result ? (
                          <span className="inline-flex items-center gap-2">
                            <span className={`font-headline text-lg ${
                              game.result === "W"
                                ? "text-win"
                                : game.result === "L"
                                ? "text-loss"
                                : "text-tie"
                            }`}>
                              {game.result}
                            </span>
                            <span className="font-medium text-white">
                              {game.ourScore}-{game.theirScore}
                            </span>
                          </span>
                        ) : (
                          <span className="text-white/40">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {games.length === 0 && (
              <div className="text-center py-12 text-white/50">
                No games scheduled yet for this season
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Roster Section */}
      <section id="roster" className="py-12 bg-dark text-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-headline text-3xl uppercase tracking-tight">
              <span className="text-white/50">2026</span> Roster
            </h2>
            <Link
              href="/stats"
              className="text-teal font-medium hover:text-teal/80 transition-colors text-sm uppercase tracking-wide"
            >
              Full Stats
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rosterWithStats
              .sort((a, b) => {
                // Sort by AVG descending for players with at-bats, then by jersey number
                if (a.batting && b.batting && a.batting.atBats > 0 && b.batting.atBats > 0) {
                  return b.batting.avg - a.batting.avg;
                }
                if (a.batting && a.batting.atBats > 0) return -1;
                if (b.batting && b.batting.atBats > 0) return 1;
                return a.jerseyNumber - b.jerseyNumber;
              })
              .map((player) => (
                <Link
                  key={player._id}
                  href={`/roster/${player.slug}`}
                  className="group relative flex bg-[#2d2d2d] overflow-hidden hover:bg-[#333] transition-colors h-64"
                >
                  {/* Left Content */}
                  <div className="flex-1 p-6 flex flex-col z-10">
                    {/* Jersey Number Box */}
                    <div className="w-14 h-14 border-2 border-white/80 flex items-center justify-center">
                      <span className="font-headline text-2xl text-white">{player.jerseyNumber}</span>
                    </div>

                    {/* Name & Position */}
                    <div className="mt-6">
                      <h3 className="font-headline text-2xl uppercase tracking-tight text-white group-hover:text-teal transition-colors">
                        {player.name}
                      </h3>
                      <p className="text-white/50 mt-1">{player.position}</p>
                    </div>

                    {/* Stats */}
                    {player.batting && player.batting.atBats > 0 && (
                      <div className="flex gap-8 mt-auto">
                        <div>
                          <p className="text-white/50 text-xs uppercase tracking-wide">AVG</p>
                          <p className="font-headline text-xl text-white">{player.batting.avg.toFixed(3).replace(/^0/, '')}</p>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs uppercase tracking-wide">SLG</p>
                          <p className="font-headline text-xl text-white">{player.batting.slg.toFixed(3).replace(/^0/, '')}</p>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs uppercase tracking-wide">OPS</p>
                          <p className="font-headline text-xl text-white">{player.batting.ops.toFixed(3).replace(/^0/, '')}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Orange Circle Background - only show for players with photos */}
                  {player.photo && (
                    <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-orange rounded-full" />
                  )}

                  {/* Player Photo or Placeholder Icon */}
                  {player.photo ? (
                    <div className="absolute right-0 top-0 bottom-0 w-56 z-10">
                      <Image
                        src={urlFor(player.photo).width(448).height(512).url()}
                        alt={player.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                  ) : (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10">
                      <svg className="w-28 h-28 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </Link>
              ))}
          </div>

          {rosterWithStats.length === 0 && (
            <div className="text-center py-12 text-white/50">
              No active players on the roster
            </div>
          )}
        </div>
      </section>

      {/* Managers */}
      <section className="py-12 bg-dark text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-3xl uppercase tracking-tight mb-8 text-center">
            <span className="text-white/50">Team</span> Managers
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 p-6">
              <h3 className="font-headline text-xl uppercase tracking-tight text-teal">Ryan Rangel</h3>
              <p className="text-white/60 mt-1">Manager</p>
              <a
                href="mailto:rx31424@gmail.com"
                className="inline-flex items-center gap-2 mt-3 text-white/80 hover:text-teal transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                rx31424@gmail.com
              </a>
            </div>
            <div className="bg-white/5 border border-white/10 p-6">
              <h3 className="font-headline text-xl uppercase tracking-tight text-teal">Matt Rickard</h3>
              <p className="text-white/60 mt-1">Manager</p>
              <a
                href="mailto:Matthewrickard11@gmail.com"
                className="inline-flex items-center gap-2 mt-3 text-white/80 hover:text-teal transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Matthewrickard11@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-12 bg-dark text-white scroll-mt-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-3xl uppercase tracking-tight mb-8 text-center">
            <span className="text-white/50">Get in</span> Touch
          </h2>
          <ContactForm darkMode />
        </div>
      </section>
    </div>
  );
}
