import { client } from "@/lib/sanity/client";
import { recurringPracticesQuery } from "@/lib/sanity/queries";
import type { RecurringPractice } from "@/types/sanity";

export const dynamic = "force-dynamic";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

async function getPracticeData() {
  const practices = await client.fetch<RecurringPractice[]>(recurringPracticesQuery);
  return { practices };
}

export default async function PracticePage() {
  const { practices } = await getPracticeData();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl uppercase tracking-tight text-white mb-2">
        Practice <span className="text-teal">Schedule</span>
      </h1>
      <p className="text-white/60 mb-8">
        Regular practice times for the current season
      </p>

      {practices.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-8 text-center text-white/50">
          No practices currently scheduled
        </div>
      ) : (
        <div className="space-y-4">
          {practices.map((practice) => {
            const dayName = DAY_NAMES[parseInt(practice.dayOfWeek, 10)] || "Unknown";

            return (
              <div
                key={practice._id}
                className="bg-white/5 border border-white/10 border-l-4 border-l-teal overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-teal text-dark text-xs font-headline uppercase px-2 py-1">
                          {dayName}s
                        </span>
                        <span className="font-headline text-2xl text-white">
                          {practice.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{practice.location}</span>
                      </div>
                    </div>
                    {practice.notes && (
                      <div className="md:text-right">
                        <p className="text-white/50 text-sm italic">{practice.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
