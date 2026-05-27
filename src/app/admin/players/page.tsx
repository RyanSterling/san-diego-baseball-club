"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminButton, AdminLoadingState } from "@/components/admin/ui";
import { urlFor } from "@/lib/sanity/image";

interface Player {
  _id: string;
  name: string;
  jerseyNumber: number;
  position: string;
  photo: unknown | null;
  isActive: boolean;
  seasons: { _id: string; name: string }[] | null;
}

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const res = await fetch("/api/admin/players");
        const data = await res.json();
        if (data.success) {
          setPlayers(data.players);
        }
      } catch (error) {
        console.error("Failed to fetch players:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl uppercase tracking-tight text-white">
            Players
          </h1>
        </div>
        <AdminLoadingState variant="table" rows={5} />
      </div>
    );
  }

  const activePlayers = players.filter((p) => p.isActive);
  const inactivePlayers = players.filter((p) => !p.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-headline text-3xl uppercase tracking-tight text-white">
          Players
        </h1>
        <Link href="/admin/players/new">
          <AdminButton>Add Player</AdminButton>
        </Link>
      </div>

      {/* Active Players */}
      <div>
        <h2 className="font-headline text-xl uppercase tracking-tight text-white/70 mb-4">
          Active Roster ({activePlayers.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePlayers.map((player) => (
            <PlayerCard key={player._id} player={player} />
          ))}
        </div>
      </div>

      {/* Inactive Players */}
      {inactivePlayers.length > 0 && (
        <div>
          <h2 className="font-headline text-xl uppercase tracking-tight text-white/50 mb-4">
            Inactive ({inactivePlayers.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactivePlayers.map((player) => (
              <PlayerCard key={player._id} player={player} />
            ))}
          </div>
        </div>
      )}

      {players.length === 0 && (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-white/50">No players yet</p>
          <Link href="/admin/players/new">
            <AdminButton className="mt-4">Add First Player</AdminButton>
          </Link>
        </div>
      )}
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <Link
      href={`/admin/players/${player._id}`}
      className={`flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-teal/30 transition-colors ${
        !player.isActive ? "opacity-50" : ""
      }`}
    >
      {/* Photo */}
      <div className="w-14 h-14 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
        {player.photo ? (
          <img
            src={urlFor(player.photo).width(112).height(112).url()}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-teal font-headline text-lg">
            #{player.jerseyNumber}
          </span>
          <span className="text-white font-medium truncate">{player.name}</span>
        </div>
        <p className="text-white/50 text-sm">{player.position}</p>
      </div>

      {/* Arrow */}
      <svg
        className="w-5 h-5 text-white/30 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}
