"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminDatePicker,
  AdminCard,
} from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui/AdminToast";

interface Season {
  _id: string;
  name: string;
}

export default function NewGamePage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    seasonId: "",
    date: "",
    opponent: "",
    location: "",
    homeOrAway: "home",
    gameChangerLink: "",
  });

  useEffect(() => {
    async function fetchSeasons() {
      const res = await fetch("/api/admin/seasons");
      const data = await res.json();
      if (data.success) {
        setSeasons(data.seasons);
        // Pre-select current season
        const current = data.seasons.find((s: { isCurrent: boolean }) => s.isCurrent);
        if (current) {
          setForm((f) => ({ ...f, seasonId: current._id }));
        }
      }
    }
    fetchSeasons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create game");
      }

      showSuccess("Game created successfully");
      router.push("/admin/games");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-3xl uppercase tracking-tight text-white mb-6">
        Add <span className="text-teal">Game</span>
      </h1>

      <form onSubmit={handleSubmit}>
        <AdminCard>
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

            <AdminInput
              label="Opponent"
              value={form.opponent}
              onChange={(v) => setForm({ ...form, opponent: v })}
              placeholder="Team name"
              required
            />

            <AdminInput
              label="Location"
              value={form.location}
              onChange={(v) => setForm({ ...form, location: v })}
              placeholder="Field name"
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

            <AdminInput
              label="GameChanger Link"
              type="url"
              value={form.gameChangerLink}
              onChange={(v) => setForm({ ...form, gameChangerLink: v })}
              placeholder="https://gc.com/..."
            />
          </div>
        </AdminCard>

        <div className="flex gap-3 mt-6">
          <AdminButton type="submit" loading={loading}>
            Create Game
          </AdminButton>
          <AdminButton
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
