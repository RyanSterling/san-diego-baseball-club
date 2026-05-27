import Link from "next/link";
import type { BattingStats, PitchingStats } from "@/types/sanity";
import TwoToneTitle from "@/components/ui/TwoToneTitle";

interface PlayerInfo {
  _id: string;
  name: string;
  slug: string;
  jerseyNumber: number;
}

interface LeaderboardProps {
  title: string;
  leaders: Array<{
    player: PlayerInfo;
    batting?: BattingStats | null;
    pitching?: PitchingStats | null;
  }>;
  statKey: keyof BattingStats | keyof PitchingStats;
  isPitching?: boolean;
  formatFn?: (value: number) => string;
}

export default function Leaderboard({
  title,
  leaders,
  statKey,
  isPitching = false,
  formatFn = (v) => String(v),
}: LeaderboardProps) {
  if (leaders.length === 0) return null;

  // Split title for two-tone effect (e.g., "Batting Average" -> "Batting" + "Average")
  const titleParts = title.split(" ");
  const prefix = titleParts.slice(0, -1).join(" ") || title;
  const highlight = titleParts.length > 1 ? titleParts[titleParts.length - 1] : "";

  return (
    <div className="bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-cream">
        {highlight ? (
          <TwoToneTitle prefix={prefix} highlight={highlight} accentColor="orange" size="sm" />
        ) : (
          <h3 className="font-headline text-lg uppercase tracking-tight text-dark">{title}</h3>
        )}
      </div>
      <div className="divide-y divide-cream">
        {leaders.map((leader, index) => {
          const stats = isPitching ? leader.pitching : leader.batting;
          const value = stats ? (stats as any)[statKey] : 0;

          // Rank colors: 1st = orange, 2nd = teal, 3rd = pink
          const rankColors =
            index === 0
              ? "bg-orange text-white"
              : index === 1
              ? "bg-teal text-dark"
              : index === 2
              ? "bg-pink text-white"
              : "bg-cream text-dark/60";

          return (
            <Link
              key={leader.player._id}
              href={`/roster/${leader.player.slug}`}
              className={`flex items-center justify-between px-4 py-3 hover:bg-cream/50 transition-colors ${
                index % 2 === 1 ? "bg-cream/30" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-headline ${rankColors}`}
                >
                  {index + 1}
                </span>
                <span className="text-dark">
                  <span className="text-dark/50 text-sm">#{leader.player.jerseyNumber}</span>{" "}
                  {leader.player.name}
                </span>
              </div>
              <span
                className={`font-headline text-lg ${
                  index === 0 ? "text-orange" : "text-dark"
                }`}
              >
                {formatFn(value)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
