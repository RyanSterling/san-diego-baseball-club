import type { RecurringPractice } from "@/types/sanity";
import Badge from "@/components/ui/Badge";

interface RecurringPracticeCardProps {
  practice: RecurringPractice;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function RecurringPracticeCard({ practice }: RecurringPracticeCardProps) {
  const dayName = DAY_NAMES[parseInt(practice.dayOfWeek, 10)] || "Unknown";

  return (
    <div className="bg-white shadow-sm p-4 border-l-4 border-teal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Badge variant="teal">Practice</Badge>
          <p className="font-headline text-lg uppercase tracking-tight text-dark mt-2">
            {practice.location}
          </p>
          {practice.notes && (
            <p className="text-dark/50 text-sm italic mt-1">{practice.notes}</p>
          )}
        </div>
        <div className="text-left sm:text-right">
          <p className="font-headline text-dark uppercase tracking-tight">
            Every {dayName}
          </p>
          <p className="text-dark/60 text-sm">{practice.time}</p>
        </div>
      </div>
    </div>
  );
}
