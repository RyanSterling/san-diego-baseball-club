"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminButton,
  AdminInput,
  AdminDatePicker,
  AdminCheckbox,
  AdminCard,
} from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui/AdminToast";

export default function NewSeasonPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    teamFundTotal: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          teamFundTotal: form.teamFundTotal ? parseFloat(form.teamFundTotal) : 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create season");
      }

      showSuccess("Season created successfully");
      router.push("/admin/seasons");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to create season");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-3xl uppercase tracking-tight text-white mb-6">
        Add <span className="text-teal">Season</span>
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

        <div className="flex gap-3 mt-6">
          <AdminButton type="submit" loading={loading}>
            Create Season
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
