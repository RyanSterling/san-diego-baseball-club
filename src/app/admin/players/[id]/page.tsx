"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminCheckbox,
  AdminCard,
  AdminModal,
  AdminLoadingState,
  AdminImageUpload,
} from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui/AdminToast";
import { urlFor } from "@/lib/sanity/image";

interface Season {
  _id: string;
  name: string;
}

interface Player {
  _id: string;
  name: string;
  jerseyNumber: number;
  position: string;
  photo: unknown | null;
  bio: string | null;
  battingSide: string | null;
  throwingSide: string | null;
  isActive: boolean;
  seasons: Season[] | null;
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

export default function EditPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const playerId = params.id as string;
  const { showSuccess, showError } = useToast();

  const [player, setPlayer] = useState<Player | null>(null);
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [playerRes, seasonsRes] = await Promise.all([
          fetch(`/api/admin/players/${playerId}`),
          fetch("/api/admin/seasons"),
        ]);

        const playerData = await playerRes.json();
        const seasonsData = await seasonsRes.json();

        if (playerData.success && playerData.player) {
          const p = playerData.player;
          setPlayer(p);
          setForm({
            name: p.name || "",
            jerseyNumber: p.jerseyNumber?.toString() || "",
            position: p.position || "",
            bio: p.bio || "",
            battingSide: p.battingSide || "",
            throwingSide: p.throwingSide || "",
            seasonIds: p.seasons?.map((s: Season) => s._id) || [],
            isActive: p.isActive !== false,
          });
          if (p.photo) {
            setPhotoPreview(urlFor(p.photo).width(200).url());
          }
        }

        if (seasonsData.success) {
          setAllSeasons(seasonsData.seasons);
        }
      } catch (error) {
        console.error("Failed to fetch player:", error);
        showError("Failed to load player");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [playerId, showError]);

  const handleSeasonToggle = (seasonId: string) => {
    setForm((f) => ({
      ...f,
      seasonIds: f.seasonIds.includes(seasonId)
        ? f.seasonIds.filter((id) => id !== seasonId)
        : [...f.seasonIds, seasonId],
    }));
  };

  const handlePhotoChange = useCallback(
    async (file: File | null, preview: string | null) => {
      setPhotoPreview(preview);

      if (file) {
        setUploadingPhoto(true);
        try {
          const formData = new FormData();
          formData.append("photo", file);

          const res = await fetch(`/api/admin/players/${playerId}/photo`, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Failed to upload photo");
          }

          showSuccess("Photo uploaded");
        } catch (error) {
          showError(error instanceof Error ? error.message : "Failed to upload photo");
          setPhotoPreview(player?.photo ? urlFor(player.photo).width(200).url() : null);
        } finally {
          setUploadingPhoto(false);
        }
      }
    },
    [playerId, player, showSuccess, showError]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update player");
      }

      showSuccess("Player updated");
      router.push("/admin/players");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to update player");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete player");
      }

      showSuccess("Player deleted");
      router.push("/admin/players");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to delete player");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <AdminLoadingState variant="form" rows={6} />;
  }

  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-white/50">Player not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-3xl uppercase tracking-tight text-white mb-6">
        Edit <span className="text-teal">Player</span>
      </h1>

      <form onSubmit={handleSubmit}>
        <AdminCard title="Photo">
          <AdminImageUpload
            value={photoPreview}
            onChange={handlePhotoChange}
            label={uploadingPhoto ? "Uploading..." : undefined}
          />
        </AdminCard>

        <AdminCard title="Player Info" className="mt-6">
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
            {allSeasons.map((season) => (
              <AdminCheckbox
                key={season._id}
                label={season.name}
                checked={form.seasonIds.includes(season._id)}
                onChange={() => handleSeasonToggle(season._id)}
              />
            ))}
          </div>
        </AdminCard>

        <div className="flex justify-between mt-6">
          <AdminButton
            type="button"
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Player
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
        title="Delete Player"
        message={`Are you sure you want to delete ${player.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
