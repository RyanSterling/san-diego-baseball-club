"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminDatePicker,
  AdminCard,
  AdminModal,
  AdminLoadingState,
} from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui/AdminToast";

interface FundEntry {
  _id: string;
  date: string;
  description: string;
  amount: number;
  type: "in" | "out";
}

export default function EditFundEntryPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;
  const { showSuccess, showError } = useToast();

  const [entry, setEntry] = useState<FundEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [form, setForm] = useState({
    date: "",
    description: "",
    amount: "",
    type: "in",
  });

  useEffect(() => {
    async function fetchEntry() {
      try {
        const res = await fetch(`/api/admin/fund-entries/${entryId}`);
        const data = await res.json();

        if (data.success && data.entry) {
          const e = data.entry;
          setEntry(e);
          setForm({
            date: e.date || "",
            description: e.description || "",
            amount: e.amount?.toString() || "",
            type: e.type || "in",
          });
        }
      } catch (error) {
        console.error("Failed to fetch entry:", error);
        showError("Failed to load entry");
      } finally {
        setLoading(false);
      }
    }

    fetchEntry();
  }, [entryId, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/fund-entries/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update entry");
      }

      showSuccess("Entry updated");
      router.push("/admin/fund");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to update entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/fund-entries/${entryId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete entry");
      }

      showSuccess("Entry deleted");
      router.push("/admin/fund");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to delete entry");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <AdminLoadingState variant="form" rows={4} />;
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-white/50">Entry not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-3xl uppercase tracking-tight text-white mb-6">
        Edit <span className="text-teal">Fund Entry</span>
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

        <div className="flex justify-between mt-6">
          <AdminButton
            type="button"
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Entry
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
        title="Delete Entry"
        message="Are you sure you want to delete this fund entry? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
