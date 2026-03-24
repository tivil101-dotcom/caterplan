"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import type { EventDayInput, EventServiceInput } from "@/lib/events/types";

interface EventDayFieldsProps {
  value: EventDayInput[];
  onChange: (days: EventDayInput[]) => void;
}

const EMPTY_SERVICE: EventServiceInput = { name: "", guest_count: null };

export function EventDayFields({ value, onChange }: EventDayFieldsProps) {
  function addDay() {
    onChange([
      ...value,
      {
        date: "",
        label: "",
        sort_order: value.length,
        services: [{ ...EMPTY_SERVICE }],
      },
    ]);
  }

  function removeDay(index: number) {
    if (value.length <= 1) return;
    onChange(value.filter((_, i) => i !== index));
  }

  function updateDay(index: number, field: "date" | "label", val: string) {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  }

  function addService(dayIndex: number) {
    const updated = [...value];
    updated[dayIndex] = {
      ...updated[dayIndex],
      services: [...updated[dayIndex].services, { ...EMPTY_SERVICE }],
    };
    onChange(updated);
  }

  function removeService(dayIndex: number, svcIndex: number) {
    const updated = [...value];
    const services = updated[dayIndex].services.filter(
      (_, i) => i !== svcIndex
    );
    updated[dayIndex] = {
      ...updated[dayIndex],
      services: services.length ? services : [{ ...EMPTY_SERVICE }],
    };
    onChange(updated);
  }

  function updateService(
    dayIndex: number,
    svcIndex: number,
    field: keyof EventServiceInput,
    val: string
  ) {
    const updated = [...value];
    const services = [...updated[dayIndex].services];
    if (field === "guest_count") {
      services[svcIndex] = {
        ...services[svcIndex],
        guest_count: val ? parseInt(val, 10) : null,
      };
    } else {
      services[svcIndex] = { ...services[svcIndex], [field]: val };
    }
    updated[dayIndex] = { ...updated[dayIndex], services };
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      <Label>Event days</Label>
      {value.map((day, dayIdx) => (
        <div
          key={dayIdx}
          className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
        >
          {/* Day header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-zinc-500">
                Day label {value.length > 1 && `(Day ${dayIdx + 1})`}
              </label>
              <Input
                placeholder="e.g. Welcome Party"
                value={day.label}
                onChange={(e) => updateDay(dayIdx, "label", e.target.value)}
              />
            </div>
            <div className="w-full space-y-1 sm:w-40">
              <label className="text-xs text-zinc-500">Date</label>
              <Input
                type="date"
                value={day.date}
                onChange={(e) => updateDay(dayIdx, "date", e.target.value)}
              />
            </div>
            {value.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDay(dayIdx)}
                className="shrink-0 text-zinc-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Services for this day */}
          <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <label className="text-xs font-medium text-zinc-500">
              Services
            </label>
            {day.services.map((svc, svcIdx) => (
              <div key={svcIdx} className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="e.g. Dinner"
                    value={svc.name}
                    onChange={(e) =>
                      updateService(dayIdx, svcIdx, "name", e.target.value)
                    }
                  />
                </div>
                <div className="w-24 space-y-1">
                  <Input
                    type="number"
                    min={0}
                    placeholder="Guests"
                    value={svc.guest_count ?? ""}
                    onChange={(e) =>
                      updateService(
                        dayIdx,
                        svcIdx,
                        "guest_count",
                        e.target.value
                      )
                    }
                  />
                </div>
                {day.services.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeService(dayIdx, svcIdx)}
                    className="shrink-0 text-zinc-400 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => addService(dayIdx)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add service
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addDay}>
        <Plus className="mr-1 h-3 w-3" />
        Add event day
      </Button>
    </div>
  );
}
