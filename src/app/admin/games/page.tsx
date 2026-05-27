"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminTable, AdminButton, AdminSelect, AdminLoadingState } from "@/components/admin/ui";

interface Game {
  _id: string;
  date: string;
  opponent: string;
  location: string;
  homeOrAway: string;
  result: string | null;
  ourScore: number | null;
  theirScore: number | null;
  season: { _id: string; name: string; slug: string } | null;
  hasStats: boolean;
  hasRecap: boolean;
}

interface Season {
  _id: string;
  name: string;
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeasons() {
      const res = await fetch("/api/admin/seasons");
      const data = await res.json();
      if (data.success) {
        setSeasons(data.seasons);
      }
    }
    fetchSeasons();
  }, []);

  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      const url = selectedSeason
        ? `/api/admin/games?season=${selectedSeason}`
        : "/api/admin/games";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setGames(data.games);
      }
      setLoading(false);
    }
    fetchGames();
  }, [selectedSeason]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const columns = [
    {
      key: "date",
      header: "Date",
      render: (game: Game) => (
        <span className="text-white/70">{formatDate(game.date)}</span>
      ),
    },
    {
      key: "opponent",
      header: "Opponent",
      render: (game: Game) => (
        <div>
          <span className="text-white/50 text-sm">
            {game.homeOrAway === "away" ? "@ " : "vs "}
          </span>
          <span className="text-white font-medium">{game.opponent}</span>
        </div>
      ),
    },
    {
      key: "result",
      header: "Result",
      render: (game: Game) =>
        game.result ? (
          <div className="flex items-center gap-2">
            <span
              className={`font-headline ${
                game.result === "W"
                  ? "text-win"
                  : game.result === "L"
                  ? "text-loss"
                  : "text-tie"
              }`}
            >
              {game.result}
            </span>
            <span className="text-white/50">
              {game.ourScore} - {game.theirScore}
            </span>
          </div>
        ) : (
          <span className="text-white/30">-</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (game: Game) => (
        <div className="flex gap-2">
          {game.hasStats && (
            <span className="px-2 py-0.5 bg-teal/20 text-teal text-xs rounded font-headline uppercase">
              Stats
            </span>
          )}
          {game.hasRecap && (
            <span className="px-2 py-0.5 bg-orange/20 text-orange text-xs rounded font-headline uppercase">
              Recap
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (game: Game) => (
        <div className="flex gap-2 justify-end">
          <Link href={`/admin/games/${game._id}/score`}>
            <AdminButton variant="ghost" size="sm">
              Score
            </AdminButton>
          </Link>
          <Link href={`/admin/games/${game._id}`}>
            <AdminButton variant="ghost" size="sm">
              Edit
            </AdminButton>
          </Link>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-headline text-3xl uppercase tracking-tight text-white">
          Games
        </h1>
        <Link href="/admin/games/new">
          <AdminButton>Add Game</AdminButton>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-64">
          <AdminSelect
            value={selectedSeason}
            onChange={setSelectedSeason}
            placeholder="All Seasons"
            options={seasons.map((s) => ({ value: s._id, label: s.name }))}
          />
        </div>
      </div>

      {/* Games Table */}
      {loading ? (
        <AdminLoadingState variant="table" rows={5} />
      ) : (
        <AdminTable
          columns={columns}
          data={games}
          keyExtractor={(game) => game._id}
          emptyMessage="No games found"
        />
      )}
    </div>
  );
}
