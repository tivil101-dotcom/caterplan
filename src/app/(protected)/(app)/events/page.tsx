import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventList } from "@/components/events/event-list";
import { Plus } from "lucide-react";

export default function EventsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Events
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your catering events
          </p>
        </div>
        <Link href="/events/new">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New event
          </Button>
        </Link>
      </div>
      <div className="mt-6">
        <EventList />
      </div>
    </div>
  );
}
