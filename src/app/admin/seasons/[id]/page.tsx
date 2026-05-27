"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AdminButton,
  AdminInput,
  AdminDatePicker,
  AdminCheckbox,
  AdminCard,
  AdminModal,
  AdminLoadingState,
} from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui/AdminToast";

interface Season {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  teamFundTotal: number;
}

export default function EditSeasonPage() {
  const router = useRouter();
  const params = useParams();
  const seasonId = params.id as string;
  const { showSuccess, showError } = useToast();

  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    teamFundTotal: "",
  });

  useEffect(() => {
    async function fetchSeason() {
      try {
        const res = await fetch(`/api/admin/seasons/${seasonId}`);
        const data = await res.json();

        if (data.success && data.season) {
          const s = data.season;
          setSeason(s);
          setForm({
            name: s.name || "",
            startDate: s.startDate || "",
            endDate: s.endDate || "",
            isCurrent: s.isCurrent || false,
            teamFundTotal: s.teamFundTotal?.toString() || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch season:", error);
        showError("Failed to load season");
      } finally {
        setLoading(false);
      }
    }

    fetchSeason();
  }, [seasonId, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/seasons/${seasonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          teamFundTotal: form.teamFundTotal ? parseFloat(form.teamFundTotal) : 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update season");
      }

      showSuccess("Season updated");
      router.push("/admin/seasons");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to update season");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/seasons/${seasonId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete season");
      }

      showSuccess("Season deleted");
      router.push("/admin/seasons");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to delete season");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <AdminLoadingState variant="form" rows={5} />;
  }

  if (!season) {
    return (
      <div className="text-center py-12">
        <p className="text-white/50">Season not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-3xl uppercase tracking-tight text-white mb-6">
        Edit <span className="text-teal">Season</span>
      </h1>

      <form onSubmit={handleSubmit}>
        <AdminCard>
          <div className="space-y-6">
            <AdminInput
              label="Season Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="e.g., Spring 2025"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <AdminDatePicker
                label="Start Date"
                value={form.startDate}
                onChange={(v) => setForm({ ...form, startDate: v })}
                required
              />

              <AdminDatePicker
                label="End Date"
                value={form.endDate}
                onChange={(v) => setForm({ ...form, endDate: v })}
                required
              />
            </div>

            <AdminInput
              label="Team Fund Total"
              type="number"
              value={form.teamFundTotal}
              onChange={(v) => setForm({ ...form, teamFundTotal: v })}
              placeholder="Total dues for the season"
              min={0}
              step={0.01}
            />

            <AdminCheckbox
              label="Set as Current Season"
              description="This will unset any other current season"
              checked={form.isCurrent}
              onChange={(v) => setForm({ ...form, isCurrent: v })}
            />
          </div>
        </AdminCard>

        <div className="flex justify-between mt-6">
          <AdminButton
            type="button"
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Season
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
        title="Delete Season"
        message={`Are you sure you want to delete ${season.name}? This will not delete associated games or players.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
