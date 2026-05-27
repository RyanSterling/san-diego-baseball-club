"use client";

import { useState } from "react";
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

const DAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export default function NewRecurringPracticePage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    dayOfWeek: "",
    time: "",
    location: "",
    notes: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/recurring-practices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dayOfWeek: parseInt(form.dayOfWeek),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create practice");
      }

      showSuccess("Recurring practice created");
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
        Add <span className="text-teal">Recurring Practice</span>
      </h1>

      <form onSubmit={handleSubmit}>
        <AdminCard>
          <div className="space-y-6">
            <AdminSelect
              label="Day of Week"
              value={form.dayOfWeek}
              onChange={(v) => setForm({ ...form, dayOfWeek: v })}
              options={DAYS}
              placeholder="Select day"
              required
            />

            <AdminInput
              label="Time"
              value={form.time}
              onChange={(v) => setForm({ ...form, time: v })}
              placeholder="e.g., 6:00 PM"
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

            <AdminCheckbox
              label="Active"
              description="Active practices appear on the schedule"
              checked={form.isActive}
              onChange={(v) => setForm({ ...form, isActive: v })}
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
