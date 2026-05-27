import { client } from "@/lib/sanity/client";
import { currentSeasonQuery, playersBySeasonSlugQuery } from "@/lib/sanity/queries";
import type { Player, Season } from "@/types/sanity";
import PlayerCard from "@/components/roster/PlayerCard";
import TwoToneTitle from "@/components/ui/TwoToneTitle";

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

async function getPlayers(seasonSlug: string | null): Promise<Player[]> {
  if (!seasonSlug) return [];
  return client.fetch(playersBySeasonSlugQuery, { seasonSlug });
}

export default async function RosterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const seasonSlug = await getSeasonSlug(params.season);
  const players = await getPlayers(seasonSlug);

  // Group players by position type
  const pitchers = players.filter((p) => p.position === "P");
  const catchers = players.filter((p) => p.position === "C");
  const infielders = players.filter((p) =>
    ["1B", "2B", "3B", "SS"].includes(p.position)
  );
  const outfielders = players.filter((p) =>
    ["LF", "CF", "RF"].includes(p.position)
  );
  const others = players.filter((p) => ["DH", "UTIL"].includes(p.position));

  const sections = [
    { title: "Pitchers", highlight: "Pitchers", color: "teal" as const },
    { title: "Catchers", highlight: "Catchers", color: "orange" as const, players: catchers },
    { title: "Infielders", highlight: "Infielders", color: "pink" as const, players: infielders },
    { title: "Outfielders", highlight: "Outfielders", color: "teal" as const, players: outfielders },
    { title: "Other", highlight: "Utility", color: "orange" as const, players: others },
  ].map((s, i) => ({
    ...s,
    players: i === 0 ? pitchers : s.players,
  })).filter((s) => s.players && s.players.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl uppercase tracking-tight text-dark mb-8">Roster</h1>

      {players.length === 0 ? (
        <p className="text-dark/50">No players in roster yet.</p>
      ) : (
        <div className="space-y-12">
          {sections.map((section) => (
            <div key={section.title}>
              <TwoToneTitle prefix="The" highlight={section.highlight} accentColor={section.color} size="md" />
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {section.players!.map((player) => (
                  <PlayerCard key={player._id} player={player} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
