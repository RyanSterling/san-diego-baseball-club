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

async function getHomeData(seasonSlug: string | null) {
  const [settings, seasons] = await Promise.all([
    client.fetch<SiteSettings | null>(siteSettingsQuery),
    client.fetch<Season[]>(allSeasonsQuery),
  ]);

  const selectedSeason = seasons.find((s) => s.slug === seasonSlug) || seasons.find((s) => s.isCurrent) || seasons[0];

  const [players, games, gamesWithStats] = seasonSlug
    ? await Promise.all([
        client.fetch<Player[]>(playersBySeasonSlugQuery, { seasonSlug }),
        client.fetch<Game[]>(gamesBySeasonSlugQuery, { seasonSlug }),
        client.fetch<GameWithStats[]>(gamesWithStatsBySeasonSlugQuery, { seasonSlug }),
      ])
    : [[], [], []];

  const playerStatsMap = aggregateStatsFromGames(gamesWithStats);

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

// City Connect inspired color palette
const colors = {
  charcoal: "#23252D",      // Darker charcoal background
  cardBg: "#2C2E36",        // Slightly lighter for cards/tables
  cardBorder: "#3A3D47",    // Border color for cards
  rosterCard: "#E7E2D8",    // Cream/sand for roster cards
  pink: "#E94E8C",          // Hot pink from logo ring
  orange: "#D4622B",        // Burnt orange from accents
  cream: "#F5EDE8",         // Off-white
  aqua: "#5EC8C4",          // More vibrant teal from logo center
  navy: "#1E2B4D",          // Navy from hat brim
};

export default async function TestColorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const seasonSlug = await getSeasonSlug(params.season);
  const { settings, rosterWithStats, games } = await getHomeData(seasonSlug);

  const now = new Date();
  const upcomingGames = games.filter((g) => new Date(g.date) >= now);
  const pastGames = games.filter((g) => new Date(g.date) < now).reverse();

  return (
    <div
      style={{
        // Override CSS variables for this page
        ["--test-charcoal" as string]: colors.charcoal,
        ["--test-pink" as string]: colors.pink,
        ["--test-orange" as string]: colors.orange,
        ["--test-cream" as string]: colors.cream,
        ["--test-aqua" as string]: colors.aqua,
        ["--test-navy" as string]: colors.navy,
      }}
    >
      {/* Color Palette Preview */}
      <div className="bg-white/90 backdrop-blur-sm fixed top-20 right-4 z-50 p-4 rounded-lg shadow-xl border">
        <p className="text-xs font-bold mb-2 text-gray-700">TEST PALETTE</p>
        <div className="flex gap-2 mb-2">
          <div className="w-8 h-8 rounded" style={{ background: colors.charcoal }} title="Charcoal #23252D" />
          <div className="w-8 h-8 rounded" style={{ background: colors.cardBg }} title="Card #2C2E36" />
          <div className="w-8 h-8 rounded border" style={{ background: colors.rosterCard }} title="Roster #E7E2D8" />
          <div className="w-8 h-8 rounded" style={{ background: colors.orange }} title="Orange" />
          <div className="w-8 h-8 rounded" style={{ background: colors.aqua }} title="Aqua" />
        </div>
        <Link href="/" className="text-xs text-blue-600 hover:underline">
          ← Back to main site
        </Link>
      </div>

      {/* Hero - Using charcoal instead of pure black */}
      <section
        className="relative text-white py-12 md:py-16 overflow-hidden"
        style={{ background: colors.charcoal }}
      >
        {/* Background Image */}
        <Image
          src="/hero-background.png"
          alt=""
          fill
          className="object-cover opacity-30"
          priority
        />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="w-44 h-44 md:w-64 md:h-64 relative">
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

      {/* Schedule Section - Charcoal background */}
      <section
        id="schedule"
        className="py-12 text-white scroll-mt-16"
        style={{ background: colors.charcoal }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-3xl uppercase tracking-tight mb-6">
            <span style={{ color: colors.aqua }}>2026</span> Schedule
          </h2>

          <div
            className="overflow-hidden"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: colors.charcoal }}>
                  <tr>
                    <th className="text-left px-4 py-3 font-headline uppercase text-xs tracking-wide text-white/70">Date</th>
                    <th className="text-left px-4 py-3 font-headline uppercase text-xs tracking-wide text-white/70">Opponent</th>
                    <th className="text-left px-4 py-3 font-headline uppercase text-xs tracking-wide text-white/70 hidden sm:table-cell">Location</th>
                    <th className="text-center px-4 py-3 font-headline uppercase text-xs tracking-wide text-white/70">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ ["--tw-divide-color" as string]: colors.cardBorder }}>
                  {/* Upcoming Games */}
                  {upcomingGames.slice(0, 5).map((game) => (
                    <tr key={game._id} className="hover:bg-black/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-white">{formatDate(game.date)}</div>
                        <div className="text-white/50 text-sm">{formatTime(game.date)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-headline uppercase px-1.5 py-0.5"
                            style={{
                              background: game.homeOrAway === "home" ? colors.aqua : "rgba(255,255,255,0.1)",
                              color: game.homeOrAway === "home" ? colors.charcoal : colors.aqua
                            }}
                          >
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
                    <tr key={game._id} className="hover:bg-black/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-white/70">{formatDate(game.date)}</div>
                        <div className="text-white/40 text-sm">{formatTime(game.date)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-headline uppercase px-1.5 py-0.5"
                            style={{
                              background: game.homeOrAway === "home" ? colors.aqua : "rgba(255,255,255,0.1)",
                              color: game.homeOrAway === "home" ? colors.charcoal : colors.aqua
                            }}
                          >
                            {game.homeOrAway === "home" ? "vs" : "@"}
                          </span>
                          <span className="font-medium text-white/70">{game.opponent}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/40 hidden sm:table-cell">{game.location}</td>
                      <td className="px-4 py-3 text-center">
                        {game.result ? (
                          <Link
                            href={`/schedule/${game.slug}`}
                            className="inline-flex items-center gap-2 hover:opacity-80"
                          >
                            <span
                              className="font-headline text-lg"
                              style={{
                                color: game.result === "W" ? "#22C55E" : game.result === "L" ? colors.pink : "#EAB308"
                              }}
                            >
                              {game.result}
                            </span>
                            <span className="font-medium text-white">
                              {game.ourScore}-{game.theirScore}
                            </span>
                          </Link>
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
      <section
        id="roster"
        className="py-12 text-white scroll-mt-16"
        style={{ background: colors.charcoal }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-headline text-3xl uppercase tracking-tight">
              <span style={{ color: colors.aqua }}>2026</span> Roster
            </h2>
            <Link
              href="/stats"
              className="font-medium transition-colors text-sm uppercase tracking-wide"
              style={{ color: colors.aqua }}
            >
              Full Stats
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {rosterWithStats
              .sort((a, b) => {
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
                  className="group p-6 text-center transition-all"
                  style={{
                    background: colors.rosterCard,
                    border: `1px solid transparent`,
                  }}
                >
                  {/* Jersey Number */}
                  <div className="flex justify-end mb-2">
                    <span
                      className="font-headline text-2xl"
                      style={{ color: colors.orange }}
                    >
                      #{player.jerseyNumber}
                    </span>
                  </div>

                  {/* Circular Photo */}
                  <div
                    className="w-28 h-28 mx-auto rounded-full overflow-hidden relative"
                    style={{
                      background: colors.aqua,
                    }}
                  >
                    {player.photo ? (
                      <Image
                        src={urlFor(player.photo).width(224).height(224).url()}
                        alt={player.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/60">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3
                    className="font-headline text-xl uppercase tracking-tight mt-4 group-hover:transition-colors"
                    style={{ color: colors.charcoal }}
                  >
                    {player.name}
                  </h3>

                  {/* Position */}
                  <p style={{ color: "#666" }} className="mt-1">{player.position}</p>
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

      {/* Managers - Accent with pink */}
      <section
        className="py-12 text-white"
        style={{ background: colors.charcoal }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-3xl uppercase tracking-tight mb-8 text-center">
            <span style={{ color: colors.aqua }}>Team</span> Managers
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div
              className="p-6"
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`
              }}
            >
              <h3
                className="font-headline text-xl uppercase tracking-tight"
                style={{ color: colors.orange }}
              >
                Ryan Rangel
              </h3>
              <p className="text-white/60 mt-1">Manager</p>
              <a
                href="mailto:rx31424@gmail.com"
                className="inline-flex items-center gap-2 mt-3 text-white/80 transition-colors hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                rx31424@gmail.com
              </a>
            </div>
            <div
              className="p-6"
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`
              }}
            >
              <h3
                className="font-headline text-xl uppercase tracking-tight"
                style={{ color: colors.orange }}
              >
                Matt Rickard
              </h3>
              <p className="text-white/60 mt-1">Manager</p>
              <a
                href="mailto:Matthewrickard11@gmail.com"
                className="inline-flex items-center gap-2 mt-3 text-white/80 transition-colors hover:text-white"
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
    </div>
  );
}
