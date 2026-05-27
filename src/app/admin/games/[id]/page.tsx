"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminDatePicker,
  AdminCard,
  AdminModal,
  AdminLoadingState,
  AdminRichText,
} from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui/AdminToast";

interface Season {
  _id: string;
  name: string;
}

interface Game {
  _id: string;
  date: string;
  opponent: string;
  location: string;
  homeOrAway: string;
  result: string | null;
  ourScore: number | null;
  theirScore: number | null;
  recap: string | null;
  gameChangerLink: string | null;
  season: { _id: string; name: string } | null;
}

export default function EditGamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as string;
  const { showSuccess, showError } = useToast();

  const [game, setGame] = useState<Game | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [form, setForm] = useState({
    seasonId: "",
    date: "",
    opponent: "",
    location: "",
    homeOrAway: "home",
    result: "",
    ourScore: "",
    theirScore: "",
    recap: "",
    gameChangerLink: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [gameRes, seasonsRes] = await Promise.all([
          fetch(`/api/admin/games/${gameId}`),
          fetch("/api/admin/seasons"),
        ]);

        const gameData = await gameRes.json();
        const seasonsData = await seasonsRes.json();

        if (gameData.success && gameData.game) {
          const g = gameData.game;
          setGame(g);
          setForm({
            seasonId: g.season?._id || "",
            date: g.date ? g.date.slice(0, 16) : "",
            opponent: g.opponent || "",
            location: g.location || "",
            homeOrAway: g.homeOrAway || "home",
            result: g.result || "",
            ourScore: g.ourScore?.toString() || "",
            theirScore: g.theirScore?.toString() || "",
            recap: g.recap || "",
            gameChangerLink: g.gameChangerLink || "",
          });
        }

        if (seasonsData.success) {
          setSeasons(seasonsData.seasons);
        }
      } catch (error) {
        console.error("Failed to fetch game:", error);
        showError("Failed to load game");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [gameId, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonId: form.seasonId,
          date: form.date,
          opponent: form.opponent,
          location: form.location,
          homeOrAway: form.homeOrAway,
          result: form.result || undefined,
          ourScore: form.ourScore ? parseInt(form.ourScore) : undefined,
          theirScore: form.theirScore ? parseInt(form.theirScore) : undefined,
          recap: form.recap || undefined,
          gameChangerLink: form.gameChangerLink || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update game");
      }

      showSuccess("Game updated successfully");
      router.push("/admin/games");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to update game");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/games/${gameId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete game");
      }

      showSuccess("Game deleted");
      router.push("/admin/games");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to delete game");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <AdminLoadingState variant="form" rows={6} />;
  }

  if (!game) {
    return (
      <div className="text-center py-12">
        <p className="text-white/50">Game not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-3xl uppercase tracking-tight text-white">
          Edit <span className="text-teal">Game</span>
        </h1>
        <div className="flex gap-2">
          <Link href={`/admin/games/${gameId}/score`}>
            <AdminButton variant="secondary" size="sm">
              Quick Score
            </AdminButton>
          </Link>
          <Link href="/admin/stats-entry">
            <AdminButton variant="secondary" size="sm">
              Add Stats
            </AdminButton>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <AdminCard title="Game Details">
          <div className="space-y-6">
            <AdminSelect
              label="Season"
              value={form.seasonId}
              onChange={(v) => setForm({ ...form, seasonId: v })}
              options={seasons.map((s) => ({ value: s._id, label: s.name }))}
              placeholder="Select season"
              required
            />

            <AdminDatePicker
              label="Date & Time"
              value={form.date}
              onChange={(v) => setForm({ ...form, date: v })}
              includeTime
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <AdminInput
                label="Opponent"
                value={form.opponent}
                onChange={(v) => setForm({ ...form, opponent: v })}
                placeholder="Team name"
                required
              />

              <AdminSelect
                label="Home or Away"
                value={form.homeOrAway}
                onChange={(v) => setForm({ ...form, homeOrAway: v })}
                options={[
                  { value: "home", label: "Home" },
                  { value: "away", label: "Away" },
                ]}
              />
            </div>

            <AdminInput
              label="Location"
              value={form.location}
              onChange={(v) => setForm({ ...form, location: v })}
              placeholder="Field name"
              required
            />

            <AdminInput
              label="GameChanger Link"
              type="url"
              value={form.gameChangerLink}
              onChange={(v) => setForm({ ...form, gameChangerLink: v })}
              placeholder="https://gc.com/..."
            />
          </div>
        </AdminCard>

        <AdminCard title="Score" className="mt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <AdminInput
                label="Our Score"
                type="number"
                value={form.ourScore}
                onChange={(v) => setForm({ ...form, ourScore: v })}
                min={0}
              />

              <AdminInput
                label="Their Score"
                type="number"
                value={form.theirScore}
                onChange={(v) => setForm({ ...form, theirScore: v })}
                min={0}
              />

              <AdminSelect
                label="Result"
                value={form.result}
                onChange={(v) => setForm({ ...form, result: v })}
                placeholder="Select"
                options={[
                  { value: "W", label: "Win" },
                  { value: "L", label: "Loss" },
                  { value: "T", label: "Tie" },
                ]}
              />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Game Recap" className="mt-6">
          <AdminRichText
            value={form.recap}
            onChange={(v) => setForm({ ...form, recap: v })}
            placeholder="Write the game recap..."
          />
        </AdminCard>

        <div className="flex justify-between mt-6">
          <AdminButton
            type="button"
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Game
          </AdminButton>

          <div className="flex gap-3">
            <AdminButton
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit" loading={saving}>
              Save Changes
            </AdminButton>
          </div>
        </div>
      </form>

      <AdminModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Game"
        message={`Are you sure you want to delete the game vs ${game.opponent}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
