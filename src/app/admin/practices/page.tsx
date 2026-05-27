"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminButton, AdminCard, AdminLoadingState } from "@/components/admin/ui";

interface Practice {
  _id: string;
  date: string;
  location: string;
  notes: string | null;
  season: { _id: string; name: string } | null;
}

interface RecurringPractice {
  _id: string;
  dayOfWeek: string;
  time: string;
  location: string;
  notes: string | null;
  isActive: boolean;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminPracticesPage() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [recurring, setRecurring] = useState<RecurringPractice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [practicesRes, recurringRes] = await Promise.all([
          fetch("/api/admin/practices"),
          fetch("/api/admin/recurring-practices"),
        ]);

        const practicesData = await practicesRes.json();
        const recurringData = await recurringRes.json();

        if (practicesData.success) setPractices(practicesData.practices);
        if (recurringData.success) setRecurring(recurringData.practices);
      } catch (error) {
        console.error("Failed to fetch practices:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-headline text-3xl uppercase tracking-tight text-white">
          Practices
        </h1>
        <AdminLoadingState variant="table" rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-headline text-3xl uppercase tracking-tight text-white">
          Practices
        </h1>
        <div className="flex gap-2">
          <Link href="/admin/practices/recurring/new">
            <AdminButton variant="secondary">Add Recurring</AdminButton>
          </Link>
          <Link href="/admin/practices/new">
            <AdminButton>Add One-off</AdminButton>
          </Link>
        </div>
      </div>

      {/* Recurring Practices */}
      <AdminCard title="Recurring Schedule">
        {recurring.length > 0 ? (
          <div className="divide-y divide-white/5 -mx-6">
            {recurring.map((p) => (
              <Link
                key={p._id}
                href={`/admin/practices/recurring/${p._id}`}
                className={`flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors ${
                  !p.isActive ? "opacity-50" : ""
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-teal font-headline">
                      {DAYS[parseInt(p.dayOfWeek)]}s
                    </span>
                    <span className="text-white/50">at</span>
                    <span className="text-white">{p.time}</span>
                  </div>
                  <p className="text-white/50 text-sm">{p.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!p.isActive && (
                    <span className="px-2 py-0.5 bg-white/10 text-white/50 text-xs rounded font-headline uppercase">
                      Inactive
                    </span>
                  )}
                  <svg
                    className="w-5 h-5 text-white/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-white/50 text-center py-4">
            No recurring practices set up
          </p>
        )}
      </AdminCard>

      {/* One-off Practices */}
      <AdminCard title="Scheduled Practices">
        {practices.length > 0 ? (
          <div className="divide-y divide-white/5 -mx-6">
            {practices.map((p) => (
              <Link
                key={p._id}
                href={`/admin/practices/${p._id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {formatDate(p.date)}
                    </span>
                    <span className="text-white/50">at</span>
                    <span className="text-teal">{formatTime(p.date)}</span>
                  </div>
                  <p className="text-white/50 text-sm">{p.location}</p>
                </div>
                <svg
                  className="w-5 h-5 text-white/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-white/50 text-center py-4">
            No scheduled practices
          </p>
        )}
      </AdminCard>
    </div>
  );
}
