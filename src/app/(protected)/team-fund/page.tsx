import { client } from "@/lib/sanity/client";
import { fundEntriesQuery, currentSeasonFundQuery } from "@/lib/sanity/queries";
import type { FundEntry, SeasonWithFund } from "@/types/sanity";

export const dynamic = "force-dynamic";

async function getFundEntries(): Promise<FundEntry[]> {
  return client.fetch(fundEntriesQuery);
}

async function getSeasonFund(): Promise<SeasonWithFund | null> {
  return client.fetch(currentSeasonFundQuery);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function TeamFundPage() {
  const [entries, seasonFund] = await Promise.all([
    getFundEntries(),
    getSeasonFund(),
  ]);

  // Calculate running balance for ledger
  let runningBalance = 0;
  const entriesWithBalance = entries.map((entry) => {
    if (entry.type === "in") {
      runningBalance += entry.amount;
    } else {
      runningBalance -= entry.amount;
    }
    return { ...entry, balance: runningBalance };
  });

  // Calculate player dues totals
  const teamTotal = seasonFund?.teamFundTotal || 0;
  const payments = seasonFund?.playerPayments || [];
  const totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const remainingBalance = teamTotal - totalPaid;

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl uppercase tracking-tight text-white">
            Team <span className="text-teal">Fund</span>
          </h1>
          {seasonFund && (
            <p className="text-white/50 mt-1">{seasonFund.name}</p>
          )}
        </div>

        {/* Player Dues Section */}
        {teamTotal > 0 && (
          <div className="mb-10">
            <h2 className="font-headline text-2xl uppercase tracking-tight text-white mb-6">
              Player <span className="text-orange">Dues</span>
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 border border-white/10 p-4">
                <p className="text-sm text-white/50 uppercase font-headline tracking-wide">Team Total</p>
                <p className="text-2xl font-headline text-white mt-1">${teamTotal.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4">
                <p className="text-sm text-white/50 uppercase font-headline tracking-wide">Collected</p>
                <p className="text-2xl font-headline text-teal mt-1">${totalPaid.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4">
                <p className="text-sm text-white/50 uppercase font-headline tracking-wide">Remaining</p>
                <p className={`text-2xl font-headline mt-1 ${remainingBalance <= 0 ? "text-teal" : "text-orange"}`}>
                  ${remainingBalance.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/5 border border-white/10 p-4 mb-6">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>{teamTotal > 0 ? Math.round((totalPaid / teamTotal) * 100) : 0}% collected</span>
                <span>${totalPaid.toFixed(2)} / ${teamTotal.toFixed(2)}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-teal h-3 rounded-full transition-all"
                  style={{ width: `${teamTotal > 0 ? Math.min((totalPaid / teamTotal) * 100, 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Player Payments Table */}
            {payments.length > 0 && (
              <div className="bg-white/5 border border-white/10 overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-headline uppercase tracking-wide text-white/50">
                        Player
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-headline uppercase tracking-wide text-white/50">
                        Amount Paid
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payments
                      .sort((a, b) => (b.amountPaid || 0) - (a.amountPaid || 0))
                      .map((payment, index) => (
                        <tr key={index} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-teal mr-2">#{payment.player.jerseyNumber}</span>
                            <span className="text-white font-medium">{payment.player.name}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-teal font-medium">
                              ${(payment.amountPaid || 0).toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {payments.length === 0 && (
              <div className="bg-white/5 border border-white/10 p-8 text-center text-white/50">
                No player payments recorded yet.
              </div>
            )}
          </div>
        )}

        {/* Expenses Ledger Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-2xl uppercase tracking-tight text-white">
              Expenses <span className="text-pink">Ledger</span>
            </h2>
            <div className="text-right">
              <p className="text-sm text-white/50 uppercase font-headline tracking-wide">Balance</p>
              <p
                className={`text-2xl font-headline ${
                  runningBalance >= 0 ? "text-teal" : "text-pink"
                }`}
              >
                ${runningBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {entriesWithBalance.length === 0 ? (
            <div className="bg-white/5 border border-white/10 p-8 text-center text-white/50">
              No fund entries yet.
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-headline uppercase tracking-wide text-white/50">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-headline uppercase tracking-wide text-white/50">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-headline uppercase tracking-wide text-white/50">
                        In
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-headline uppercase tracking-wide text-white/50">
                        Out
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-headline uppercase tracking-wide text-white/50">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {entriesWithBalance.map((entry) => (
                      <tr key={entry._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                          {formatDate(entry.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">{entry.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {entry.type === "in" ? (
                            <span className="text-teal font-medium">
                              +${entry.amount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-white/30">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {entry.type === "out" ? (
                            <span className="text-pink font-medium">
                              -${entry.amount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-white/30">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          <span className={entry.balance >= 0 ? "text-white" : "text-pink"}>
                            ${entry.balance.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
