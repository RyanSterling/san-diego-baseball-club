import type { Game } from "@/types/sanity";

interface BoxScoreProps {
  game: Game;
  teamName?: string;
}

export default function BoxScore({ game, teamName = "SDBC" }: BoxScoreProps) {
  const {
    opponent,
    homeOrAway,
    ourScore,
    theirScore,
    ourHits,
    theirHits,
  } = game;

  // Handle null/undefined arrays
  const ourInnings = game.ourInnings ?? [];
  const theirInnings = game.theirInnings ?? [];
  const ourErrors = game.ourErrors ?? 0;
  const theirErrors = game.theirErrors ?? 0;

  // Determine max innings (at least 7 for display, or actual innings played)
  const maxInnings = Math.max(7, ourInnings.length, theirInnings.length);
  const innings = Array.from({ length: maxInnings }, (_, i) => i + 1);

  // Pad innings arrays to match length
  const ourInningsPadded = [...ourInnings, ...Array(maxInnings - ourInnings.length).fill(null)];
  const theirInningsPadded = [...theirInnings, ...Array(maxInnings - theirInnings.length).fill(null)];

  // Calculate totals from innings if not provided
  const ourRunsTotal = ourScore ?? ourInnings.reduce((sum, r) => sum + (r || 0), 0);
  const theirRunsTotal = theirScore ?? theirInnings.reduce((sum, r) => sum + (r || 0), 0);

  // Determine row order based on home/away (away team bats first, shown on top)
  const isHome = homeOrAway === "home";
  const topTeam = isHome ? opponent : teamName;
  const bottomTeam = isHome ? teamName : opponent;
  const topInnings = isHome ? theirInningsPadded : ourInningsPadded;
  const bottomInnings = isHome ? ourInningsPadded : theirInningsPadded;
  const topRuns = isHome ? theirRunsTotal : ourRunsTotal;
  const bottomRuns = isHome ? ourRunsTotal : theirRunsTotal;
  const topHits = isHome ? theirHits : ourHits;
  const bottomHits = isHome ? ourHits : theirHits;
  const topErrors = isHome ? theirErrors : ourErrors;
  const bottomErrors = isHome ? ourErrors : theirErrors;

  // Check if we have box score data
  const hasBoxScoreData = ourInnings.length > 0 || theirInnings.length > 0;

  if (!hasBoxScoreData && ourScore === undefined) {
    return null;
  }

  return (
    <div className="bg-white/5 border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="bg-white/10 px-4 py-2 border-b border-white/10">
        <span className="font-headline text-sm uppercase tracking-wide text-white/60">
          {game.result === "W" ? "Final - Win" : game.result === "L" ? "Final - Loss" : game.result === "T" ? "Final - Tie" : "Final"}
        </span>
      </div>

      {/* Box Score Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 px-3 font-headline text-white/50 uppercase text-xs w-28">Team</th>
              {hasBoxScoreData && innings.map((inning) => (
                <th key={inning} className="py-2 text-center font-headline text-white/50 text-xs w-8">
                  {inning}
                </th>
              ))}
              <th className="py-2 text-center font-headline text-white uppercase text-xs w-10 border-l border-white/20">R</th>
              <th className="py-2 text-center font-headline text-white/50 uppercase text-xs w-10">H</th>
              <th className="py-2 text-center font-headline text-white/50 uppercase text-xs w-10">E</th>
            </tr>
          </thead>
          <tbody>
            {/* Top row (away team or opponent if we're home) */}
            <tr className="border-b border-white/10">
              <td className="py-3 px-3 font-medium text-white truncate">{topTeam}</td>
              {hasBoxScoreData && topInnings.map((runs, i) => (
                <td key={i} className="py-3 text-center text-white/70">
                  {runs !== null ? runs : "-"}
                </td>
              ))}
              <td className="py-3 text-center font-headline text-lg text-white border-l border-white/20">
                {topRuns}
              </td>
              <td className="py-3 text-center text-white/70">{topHits ?? "-"}</td>
              <td className="py-3 text-center text-white/70">{topErrors}</td>
            </tr>
            {/* Bottom row (home team or us if we're home) */}
            <tr>
              <td className="py-3 px-3 font-medium text-white truncate">{bottomTeam}</td>
              {hasBoxScoreData && bottomInnings.map((runs, i) => (
                <td key={i} className="py-3 text-center text-white/70">
                  {runs !== null ? runs : "-"}
                </td>
              ))}
              <td className="py-3 text-center font-headline text-lg text-white border-l border-white/20">
                {bottomRuns}
              </td>
              <td className="py-3 text-center text-white/70">{bottomHits ?? "-"}</td>
              <td className="py-3 text-center text-white/70">{bottomErrors}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
