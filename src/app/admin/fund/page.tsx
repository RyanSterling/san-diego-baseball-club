"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminButton, AdminCard, AdminLoadingState } from "@/components/admin/ui";

interface FundEntry {
  _id: string;
  date: string;
  description: string;
  amount: number;
  type: "in" | "out";
}

interface PlayerPayment {
  _key: string;
  player: {
    _id: string;
    name: string;
    jerseyNumber: number;
  };
  amountPaid: number;
}

interface SeasonFund {
  _id: string;
  name: string;
  slug: string;
  teamFundTotal: number;
  playerPayments: PlayerPayment[];
}

export default function AdminFundPage() {
  const [entries, setEntries] = useState<FundEntry[]>([]);
  const [seasonFund, setSeasonFund] = useState<SeasonFund | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [entriesRes, seasonRes] = await Promise.all([
          fetch("/api/admin/fund-entries"),
          fetch("/api/admin/season-fund"),
        ]);

        const entriesData = await entriesRes.json();
        const seasonData = await seasonRes.json();

        if (entriesData.success) {
          setEntries(entriesData.entries || []);
        }
        if (seasonData.success) {
          setSeasonFund(seasonData.seasonFund);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate running balance for ledger
  const entriesWithBalance = entries
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce<Array<FundEntry & { balance: number }>>((acc, entry) => {
      const prevBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
      const change = entry.type === "in" ? entry.amount : -entry.amount;
      acc.push({ ...entry, balance: prevBalance + change });
      return acc;
    }, [])
    .reverse();

  const totalIn = entries
    .filter((e) => e.type === "in")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalOut = entries
    .filter((e) => e.type === "out")
    .reduce((sum, e) => sum + e.amount, 0);

  const ledgerBalance = totalIn - totalOut;

  // Player dues calculations
  const teamTotal = seasonFund?.teamFundTotal || 0;
  const payments = seasonFund?.playerPayments || [];
  const totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const remainingDues = teamTotal - totalPaid;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-headline text-3xl uppercase tracking-tight text-white">
          Team Fund
        </h1>
        <AdminLoadingState variant="table" rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl uppercase tracking-tight text-white">
            Team <span className="text-teal">Fund</span>
          </h1>
          {seasonFund && (
            <p className="text-white/50 mt-1">{seasonFund.name} Season</p>
          )}
        </div>
        <Link href="/admin/fund/new">
          <AdminButton>Add Expense Entry</AdminButton>
        </Link>
      </div>

      {/* Player Dues Section */}
      {teamTotal > 0 && (
        <div className="space-y-4">
          <h2 className="font-headline text-xl uppercase tracking-tight text-white">
            Player <span className="text-orange">Dues</span>
          </h2>

          {/* Dues Summary */}
          <div className="grid grid-cols-3 gap-4">
            <AdminCard padding="md">
              <p className="text-white/50 text-sm font-headline uppercase tracking-wide">
                Team Total
              </p>
              <p className="text-2xl font-headline text-white mt-1">
                ${teamTotal.toLocaleString()}
              </p>
            </AdminCard>
            <AdminCard padding="md">
              <p className="text-white/50 text-sm font-headline uppercase tracking-wide">
                Collected
              </p>
              <p className="text-2xl font-headline text-teal mt-1">
                ${totalPaid.toLocaleString()}
              </p>
            </AdminCard>
            <AdminCard padding="md">
              <p className="text-white/50 text-sm font-headline uppercase tracking-wide">
                Remaining
              </p>
              <p
                className={`text-2xl font-headline mt-1 ${
                  remainingDues <= 0 ? "text-teal" : "text-orange"
                }`}
              >
                ${remainingDues.toLocaleString()}
              </p>
            </AdminCard>
          </div>

          {/* Progress Bar */}
          <AdminCard padding="md">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>{teamTotal > 0 ? Math.round((totalPaid / teamTotal) * 100) : 0}% collected</span>
              <span>${totalPaid.toLocaleString()} / ${teamTotal.toLocaleString()}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className="bg-teal h-3 rounded-full transition-all"
                style={{ width: `${teamTotal > 0 ? Math.min((totalPaid / teamTotal) * 100, 100) : 0}%` }}
              />
            </div>
          </AdminCard>

          {/* Player Payments Table */}
          <AdminCard title="Player Payments" padding="none">
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-headline uppercase tracking-wide text-white/70">
                        Player
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-headline uppercase tracking-wide text-white/70">
                        Amount Paid
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payments
                      .sort((a, b) => (b.amountPaid || 0) - (a.amountPaid || 0))
                      .map((payment) => (
                        <tr key={payment._key} className="hover:bg-white/5">
                          <td className="px-6 py-4">
                            <span className="text-teal mr-2">#{payment.player?.jerseyNumber}</span>
                            <span className="text-white font-medium">{payment.player?.name}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-teal font-medium">
                            ${(payment.amountPaid || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-white/50">
                No player payments recorded yet
              </div>
            )}
          </AdminCard>

          <p className="text-white/40 text-sm">
            Player payments are managed in the{" "}
            <Link href="/admin/seasons" className="text-teal hover:underline">
              Seasons
            </Link>{" "}
            section.
          </p>
        </div>
      )}

      {/* Expenses Ledger Section */}
      <div className="space-y-4">
        <h2 className="font-headline text-xl uppercase tracking-tight text-white">
          Expenses <span className="text-pink">Ledger</span>
        </h2>

        {/* Ledger Summary */}
        <div className="grid grid-cols-3 gap-4">
          <AdminCard padding="md">
            <p className="text-white/50 text-sm font-headline uppercase tracking-wide">
              Total In
            </p>
            <p className="text-2xl font-headline text-teal mt-1">
              ${totalIn.toLocaleString()}
            </p>
          </AdminCard>
          <AdminCard padding="md">
            <p className="text-white/50 text-sm font-headline uppercase tracking-wide">
              Total Out
            </p>
            <p className="text-2xl font-headline text-orange mt-1">
              ${totalOut.toLocaleString()}
            </p>
          </AdminCard>
          <AdminCard padding="md">
            <p className="text-white/50 text-sm font-headline uppercase tracking-wide">
              Balance
            </p>
            <p
              className={`text-2xl font-headline mt-1 ${
                ledgerBalance >= 0 ? "text-teal" : "text-pink"
              }`}
            >
              ${ledgerBalance.toLocaleString()}
            </p>
          </AdminCard>
        </div>

        {/* Ledger Table */}
        <AdminCard title="Ledger" padding="none">
          {entriesWithBalance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-headline uppercase tracking-wide text-white/70">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-headline uppercase tracking-wide text-white/70">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-headline uppercase tracking-wide text-white/70">
                      In
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-headline uppercase tracking-wide text-white/70">
                      Out
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-headline uppercase tracking-wide text-white/70">
                      Balance
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {entriesWithBalance.map((entry) => (
                    <tr key={entry._id} className="hover:bg-white/5">
                      <td className="px-6 py-4 text-white/70">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-6 py-4 text-white">{entry.description}</td>
                      <td className="px-6 py-4 text-right text-teal">
                        {entry.type === "in" ? `$${entry.amount.toLocaleString()}` : "-"}
                      </td>
                      <td className="px-6 py-4 text-right text-orange">
                        {entry.type === "out" ? `$${entry.amount.toLocaleString()}` : "-"}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-medium ${
                          entry.balance >= 0 ? "text-white" : "text-pink"
                        }`}
                      >
                        ${entry.balance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/fund/${entry._id}`}>
                          <AdminButton variant="ghost" size="sm">
                            Edit
                          </AdminButton>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-white/50">
              No expense entries yet
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
