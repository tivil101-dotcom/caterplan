import { cn } from "@/lib/utils";
import { STATUS_LABELS, type EventStatus } from "@/lib/events/types";

const statusStyles: Record<EventStatus, string> = {
  enquiry: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  planning:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  execution:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  complete: "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400",
};

interface StatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
