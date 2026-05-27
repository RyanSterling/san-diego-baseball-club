import Link from "next/link";
import type { Game } from "@/types/sanity";
import Badge from "@/components/ui/Badge";

interface GameCardProps {
  game: Game;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function GameCard({ game }: GameCardProps) {
  const hasResult = game.result && game.ourScore !== undefined && game.theirScore !== undefined;

  return (
    <Link
      href={`/schedule/${game.slug}`}
      className="block bg-white shadow-sm hover:shadow-md transition-shadow border border-cream"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cream">
        <Badge variant={game.homeOrAway === "home" ? "dark" : "teal"}>
          {game.homeOrAway === "home" ? "Home" : "Away"}
        </Badge>
        <span className="text-dark/60 text-sm">{formatDate(game.date)}</span>
      </div>

      {/* Main content - VS style */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-center gap-6">
          {/* Our team */}
          <div className="text-center flex-1">
            <p className="font-headline text-sm uppercase tracking-wide text-dark/50">SDBC</p>
            {hasResult && (
              <p className="font-headline text-4xl text-dark mt-1">{game.ourScore}</p>
            )}
          </div>

          {/* VS divider */}
          <div className="flex flex-col items-center">
            {hasResult ? (
              <Badge
                variant={
                  game.result === "W"
                    ? "win"
                    : game.result === "L"
                    ? "loss"
                    : "tie"
                }
                size="md"
              >
                {game.result === "W" ? "Win" : game.result === "L" ? "Loss" : "Tie"}
              </Badge>
            ) : (
              <>
                <span className="font-headline text-2xl text-dark/20">VS</span>
                <span className="text-dark/50 text-sm mt-1">{formatTime(game.date)}</span>
              </>
            )}
          </div>

          {/* Opponent */}
          <div className="text-center flex-1">
            <p className="font-headline text-sm uppercase tracking-wide text-dark/50 truncate">
              {game.opponent}
            </p>
            {hasResult && (
              <p className="font-headline text-4xl text-dark/60 mt-1">{game.theirScore}</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-cream bg-cream/30">
        <div className="flex items-center gap-1.5 text-dark/50 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate max-w-[150px]">{game.location}</span>
        </div>
        {game.hasRecap && (
          <span className="text-orange text-sm font-medium flex items-center gap-1">
            Read Recap
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </div>
    </Link>
  );
}
