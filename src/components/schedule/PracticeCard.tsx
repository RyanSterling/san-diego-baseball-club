import type { Practice } from "@/types/sanity";
import Badge from "@/components/ui/Badge";

interface PracticeCardProps {
  practice: Practice;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PracticeCard({ practice }: PracticeCardProps) {
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
            {formatDate(practice.date)}
          </p>
          <p className="text-dark/60 text-sm">{formatTime(practice.date)}</p>
        </div>
      </div>
    </div>
  );
}
