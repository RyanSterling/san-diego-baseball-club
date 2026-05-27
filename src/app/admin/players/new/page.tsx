"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminCheckbox,
  AdminCard,
} from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui/AdminToast";

interface Season {
  _id: string;
  name: string;
  isCurrent: boolean;
}

const POSITIONS = [
  { value: "P", label: "Pitcher (P)" },
  { value: "C", label: "Catcher (C)" },
  { value: "1B", label: "First Base (1B)" },
  { value: "2B", label: "Second Base (2B)" },
  { value: "3B", label: "Third Base (3B)" },
  { value: "SS", label: "Shortstop (SS)" },
  { value: "LF", label: "Left Field (LF)" },
  { value: "CF", label: "Center Field (CF)" },
  { value: "RF", label: "Right Field (RF)" },
  { value: "DH", label: "Designated Hitter (DH)" },
  { value: "UTIL", label: "Utility (UTIL)" },
];

export default function NewPlayerPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    jerseyNumber: "",
    position: "",
    bio: "",
    battingSide: "",
    throwingSide: "",
    seasonIds: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    async function fetchSeasons() {
      const res = await fetch("/api/admin/seasons");
      const data = await res.json();
      if (data.success) {
        setSeasons(data.seasons);
        // Pre-select current season
        const current = data.seasons.find((s: Season) => s.isCurrent);
        if (current) {
          setForm((f) => ({ ...f, seasonIds: [current._id] }));
        }
      }
    }
    fetchSeasons();
  }, []);

  const handleSeasonToggle = (seasonId: string) => {
    setForm((f) => ({
      ...f,
      seasonIds: f.seasonIds.includes(seasonId)
        ? f.seasonIds.filter((id) => id !== seasonId)
        : [...f.seasonIds, seasonId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create player");
      }

      showSuccess("Player created successfully");
      router.push("/admin/players");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to create player");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-3xl uppercase tracking-tight text-white mb-6">
        Add <span className="text-teal">Player</span>
      </h1>

      <form onSubmit={handleSubmit}>
        <AdminCard title="Player Info">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <AdminInput
                label="Name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="Full name"
                required
              />

              <AdminInput
                label="Jersey Number"
                type="number"
                value={form.jerseyNumber}
                onChange={(v) => setForm({ ...form, jerseyNumber: v })}
                placeholder="0-99"
                min={0}
                max={99}
                required
              />
            </div>

            <AdminSelect
              label="Position"
              value={form.position}
              onChange={(v) => setForm({ ...form, position: v })}
              options={POSITIONS}
              placeholder="Select position"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <AdminSelect
                label="Bats"
                value={form.battingSide}
                onChange={(v) => setForm({ ...form, battingSide: v })}
                options={[
                  { value: "R", label: "Right" },
                  { value: "L", label: "Left" },
                  { value: "S", label: "Switch" },
                ]}
                placeholder="Select"
              />

              <AdminSelect
                label="Throws"
                value={form.throwingSide}
                onChange={(v) => setForm({ ...form, throwingSide: v })}
                options={[
                  { value: "R", label: "Right" },
                  { value: "L", label: "Left" },
                ]}
                placeholder="Select"
              />
            </div>

            <AdminTextarea
              label="Bio"
              value={form.bio}
              onChange={(v) => setForm({ ...form, bio: v })}
              placeholder="Short bio (optional)"
              rows={3}
            />

            <AdminCheckbox
              label="Active"
              description="Active players appear on the roster"
              checked={form.isActive}
              onChange={(v) => setForm({ ...form, isActive: v })}
            />
          </div>
        </AdminCard>

        <AdminCard title="Seasons" className="mt-6">
          <p className="text-white/50 text-sm mb-4">
            Select which seasons this player is on the roster
          </p>
          <div className="space-y-2">
            {seasons.map((season) => (
              <AdminCheckbox
                key={season._id}
                label={season.name}
                checked={form.seasonIds.includes(season._id)}
                onChange={() => handleSeasonToggle(season._id)}
              />
            ))}
          </div>
        </AdminCard>

        <div className="flex gap-3 mt-6">
          <AdminButton type="submit" loading={loading}>
            Create Player
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
