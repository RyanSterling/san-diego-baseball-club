"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminTable, AdminButton, AdminLoadingState } from "@/components/admin/ui";

interface Season {
  _id: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  teamFundTotal: number;
  gameCount: number;
  playerCount: number;
}

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeasons() {
      try {
        const res = await fetch("/api/admin/seasons");
        const data = await res.json();
        if (data.success) {
          setSeasons(data.seasons);
        }
      } catch (error) {
        console.error("Failed to fetch seasons:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSeasons();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const columns = [
    {
      key: "name",
      header: "Season",
      render: (season: Season) => (
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{season.name}</span>
          {season.isCurrent && (
            <span className="px-2 py-0.5 bg-teal/20 text-teal text-xs rounded font-headline uppercase">
              Current
            </span>
          )}
        </div>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      render: (season: Season) => (
        <span className="text-white/70">
          {formatDate(season.startDate)} - {formatDate(season.endDate)}
        </span>
      ),
    },
    {
      key: "games",
      header: "Games",
      render: (season: Season) => (
        <span className="text-white/70">{season.gameCount}</span>
      ),
    },
    {
      key: "fund",
      header: "Fund Total",
      render: (season: Season) => (
        <span className="text-teal font-medium">
          ${(season.teamFundTotal || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (season: Season) => (
        <div className="flex justify-end">
          <Link href={`/admin/seasons/${season._id}`}>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-headline text-3xl uppercase tracking-tight text-white">
          Seasons
        </h1>
        <Link href="/admin/seasons/new">
          <AdminButton>Add Season</AdminButton>
        </Link>
      </div>

      {loading ? (
        <AdminLoadingState variant="table" rows={3} />
      ) : (
        <AdminTable
          columns={columns}
          data={seasons}
          keyExtractor={(s) => s._id}
          emptyMessage="No seasons yet"
        />
      )}
    </div>
  );
}
