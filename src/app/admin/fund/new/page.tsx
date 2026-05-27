"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminDatePicker,
  AdminCard,
} from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui/AdminToast";

export default function NewFundEntryPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "in",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/fund-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create entry");
      }

      showSuccess("Entry added");
      router.push("/admin/fund");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to create entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-3xl uppercase tracking-tight text-white mb-6">
        Add <span className="text-teal">Fund Entry</span>
      </h1>

      <form onSubmit={handleSubmit}>
        <AdminCard>
          <div className="space-y-6">
            <AdminSelect
              label="Type"
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v })}
              options={[
                { value: "in", label: "Money In" },
                { value: "out", label: "Money Out" },
              ]}
              required
            />

            <AdminDatePicker
              label="Date"
              value={form.date}
              onChange={(v) => setForm({ ...form, date: v })}
              required
            />

            <AdminInput
              label="Description"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              placeholder="What is this for?"
              required
            />

            <AdminInput
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(v) => setForm({ ...form, amount: v })}
              placeholder="0.00"
              min={0}
              step={0.01}
              required
            />
          </div>
        </AdminCard>

        <div className="flex gap-3 mt-6">
          <AdminButton type="submit" loading={loading}>
            Add Entry
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
