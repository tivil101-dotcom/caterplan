"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import type { ServiceDayInput } from "@/lib/events/types";

interface ServiceDayFieldsProps {
  value: ServiceDayInput[];
  onChange: (days: ServiceDayInput[]) => void;
}

export function ServiceDayFields({ value, onChange }: ServiceDayFieldsProps) {
  function addDay() {
    onChange([
      ...value,
      { date: "", guest_count: null, label: "", sort_order: value.length },
    ]);
  }

  function removeDay(index: number) {
    if (value.length <= 1) return;
    onChange(value.filter((_, i) => i !== index));
  }

  function updateDay(index: number, field: keyof ServiceDayInput, val: string) {
    const updated = [...value];
    if (field === "guest_count") {
      updated[index] = {
        ...updated[index],
        guest_count: val ? parseInt(val, 10) : null,
      };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <Label>Service days</Label>
      {value.map((day, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700 sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-1">
            <label className="text-xs text-zinc-500">
              Label {value.length > 1 && `(Day ${i + 1})`}
            </label>
            <Input
              placeholder="e.g. Welcome Party"
              value={day.label}
              onChange={(e) => updateDay(i, "label", e.target.value)}
            />
          </div>
          <div className="w-full space-y-1 sm:w-40">
            <label className="text-xs text-zinc-500">Date</label>
            <Input
              type="date"
              value={day.date}
              onChange={(e) => updateDay(i, "date", e.target.value)}
            />
          </div>
          <div className="w-full space-y-1 sm:w-28">
            <label className="text-xs text-zinc-500">Guests</label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={day.guest_count ?? ""}
              onChange={(e) => updateDay(i, "guest_count", e.target.value)}
            />
          </div>
          {value.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeDay(i)}
              className="shrink-0 text-zinc-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addDay}>
        <Plus className="mr-1 h-3 w-3" />
        Add service day
      </Button>
    </div>
  );
}
