"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminDatePicker,
  AdminTextarea,
  AdminCard,
} from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui/AdminToast";

interface Season {
  _id: string;
  name: string;
  isCurrent: boolean;
}

export default function NewPracticePage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    seasonId: "",
    date: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    async function fetchSeasons() {
      const res = await fetch("/api/admin/seasons");
      const data = await res.json();
      if (data.success) {
        setSeasons(data.seasons);
        const current = data.seasons.find((s: Season) => s.isCurrent);
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
      const res = await fetch("/api/admin/practices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create practice");
      }

      showSuccess("Practice created");
      router.push("/admin/practices");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to create practice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-3xl uppercase tracking-tight text-white mb-6">
        Add <span className="text-teal">Practice</span>
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
              label="Location"
              value={form.location}
              onChange={(v) => setForm({ ...form, location: v })}
              placeholder="Field name"
              required
            />

            <AdminTextarea
              label="Notes"
              value={form.notes}
              onChange={(v) => setForm({ ...form, notes: v })}
              placeholder="Optional notes"
              rows={3}
            />
          </div>
        </AdminCard>

        <div className="flex gap-3 mt-6">
          <AdminButton type="submit" loading={loading}>
            Create Practice
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
