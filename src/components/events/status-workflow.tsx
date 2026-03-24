"use client";

import { cn } from "@/lib/utils";
import {
  EVENT_STATUSES,
  STATUS_LABELS,
  type EventStatus,
} from "@/lib/events/types";

interface StatusWorkflowProps {
  currentStatus: EventStatus;
  onStatusChange?: (status: EventStatus) => void;
}

export function StatusWorkflow({
  currentStatus,
  onStatusChange,
}: StatusWorkflowProps) {
  const currentIndex = EVENT_STATUSES.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1">
      {EVENT_STATUSES.map((status, i) => {
        const isActive = status === currentStatus;
        const isPast = i < currentIndex;

        return (
          <button
            key={status}
            onClick={() => onStatusChange?.(status)}
            disabled={!onStatusChange}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              isActive &&
                "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900",
              isPast &&
                "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300",
              !isActive &&
                !isPast &&
                "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500",
              onStatusChange &&
                "cursor-pointer hover:ring-2 hover:ring-zinc-300 dark:hover:ring-zinc-600",
              !onStatusChange && "cursor-default"
            )}
          >
            <span className="hidden sm:inline">{STATUS_LABELS[status]}</span>
            <span className="sm:hidden">{STATUS_LABELS[status].slice(0, 3)}</span>
          </button>
        );
      })}
    </div>
  );
}
