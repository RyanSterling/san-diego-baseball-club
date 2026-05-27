import Link from "next/link";
import Image from "next/image";
import type { Player } from "@/types/sanity";
import { urlFor } from "@/lib/sanity/image";
import Badge from "@/components/ui/Badge";

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link
      href={`/roster/${player.slug}`}
      className="block bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      <div className="aspect-square bg-cream relative">
        {player.photo ? (
          <>
            <Image
              src={urlFor(player.photo).width(400).height(400).url()}
              alt={player.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-dark/30">
            <svg
              className="w-20 h-20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}

        {/* Jersey number overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="font-headline text-4xl text-white drop-shadow-lg">
            #{player.jerseyNumber}
          </span>
          <Badge variant="orange">{player.position}</Badge>
        </div>
      </div>

      <div className="p-4">
        <p className="font-headline text-lg uppercase tracking-tight text-dark truncate">
          {player.name}
        </p>
      </div>
    </Link>
  );
}
