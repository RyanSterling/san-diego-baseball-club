"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminCard, AdminLoadingState, AdminButton } from "@/components/admin/ui";

interface DashboardData {
  gamesPlayed: number;
  upcomingGames: number;
  activeRoster: number;
  fundBalance: number;
  currentSeason: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  recentGames: Array<{
    _id: string;
    slug: string;
    date: string;
    opponent: string;
    result: string | null;
    ourScore: number | null;
    theirScore: number | null;
    hasStats: boolean;
  }>;
  upcomingGamesList: Array<{
    _id: string;
    slug: string;
    date: string;
    opponent: string;
    location: string;
    homeOrAway: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/dashboard");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <AdminLoadingState variant="page" />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl uppercase tracking-tight text-white">
          Dashboard
        </h1>
        {data?.currentSeason && (
          <p className="text-white/50 mt-1">
            Current season: {data.currentSeason.name}
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Games Played"
          value={data?.gamesPlayed || 0}
          href="/admin/games"
          color="teal"
        />
        <StatCard
          label="Upcoming"
          value={data?.upcomingGames || 0}
          href="/admin/games"
          color="orange"
        />
        <StatCard
          label="Active Roster"
          value={data?.activeRoster || 0}
          href="/admin/players"
          color="pink"
        />
        <StatCard
          label="Fund Balance"
          value={`$${(data?.fundBalance || 0).toLocaleString()}`}
          href="/admin/fund"
          color="teal"
        />
      </div>

      {/* Quick Actions */}
      <AdminCard title="Quick Actions" padding="md">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/games/new">
            <AdminButton>Add Game</AdminButton>
          </Link>
          <Link href="/admin/players/new">
            <AdminButton variant="secondary">Add Player</AdminButton>
          </Link>
          <Link href="/admin/stats-entry">
            <AdminButton variant="secondary">Enter Stats</AdminButton>
          </Link>
          <Link href="/admin/fund/new">
            <AdminButton variant="secondary">Add Fund Entry</AdminButton>
          </Link>
        </div>
      </AdminCard>

      {/* Games Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Games */}
        <AdminCard
          title="Recent Games"
          actions={
            <Link href="/admin/games">
              <AdminButton variant="ghost" size="sm">
                View All
              </AdminButton>
            </Link>
          }
          padding="none"
        >
          {data?.recentGames && data.recentGames.length > 0 ? (
            <div className="divide-y divide-white/5">
              {data.recentGames.map((game) => (
                <Link
                  key={game._id}
                  href={`/admin/games/${game._id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">{game.opponent}</p>
                    <p className="text-white/50 text-sm">{formatDate(game.date)}</p>
                  </div>
                  <div className="text-right">
                    {game.result ? (
                      <>
                        <span
                          className={`font-headline text-lg ${
                            game.result === "W"
                              ? "text-win"
                              : game.result === "L"
                              ? "text-loss"
                              : "text-tie"
                          }`}
                        >
                          {game.result}
                        </span>
                        <p className="text-white/50 text-sm">
                          {game.ourScore} - {game.theirScore}
                        </p>
                      </>
                    ) : (
                      <span className="text-white/30 text-sm">No result</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-white/50">
              No recent games
            </div>
          )}
        </AdminCard>

        {/* Upcoming Games */}
        <AdminCard
          title="Upcoming Games"
          actions={
            <Link href="/admin/games/new">
              <AdminButton variant="ghost" size="sm">
                Add Game
              </AdminButton>
            </Link>
          }
          padding="none"
        >
          {data?.upcomingGamesList && data.upcomingGamesList.length > 0 ? (
            <div className="divide-y divide-white/5">
              {data.upcomingGamesList.map((game) => (
                <Link
                  key={game._id}
                  href={`/admin/games/${game._id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">
                      {game.homeOrAway === "away" ? "@ " : "vs "}
                      {game.opponent}
                    </p>
                    <p className="text-white/50 text-sm">{game.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-teal font-headline text-sm uppercase">
                      {formatDate(game.date)}
                    </p>
                    <p className="text-white/50 text-sm">{formatTime(game.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-white/50">
              No upcoming games
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  href: string;
  color: "teal" | "orange" | "pink";
}

function StatCard({ label, value, href, color }: StatCardProps) {
  const colorClasses = {
    teal: "text-teal",
    orange: "text-orange",
    pink: "text-pink",
  };

  return (
    <Link
      href={href}
      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-colors"
    >
      <p className="text-white/50 text-sm font-headline uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-3xl font-headline mt-1 ${colorClasses[color]}`}>
        {value}
      </p>
    </Link>
  );
}
