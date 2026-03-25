"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GripVertical, Trash2, ChevronDown, ChevronRight, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DIETARY_FLAGS,
  ALLERGENS,
  type MenuItem,
  type DietaryFlag,
  type Allergen,
} from "@/lib/menus/types";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface MenuItemRowProps {
  item: MenuItem;
  menuId: string;
  sectionId: string;
  allItems: MenuItem[];
  onUpdate: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
}

export function MenuItemRow({
  item,
  menuId,
  sectionId,
  allItems,
  onUpdate,
  onDelete,
}: MenuItemRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? "");
  const [dietaryFlags, setDietaryFlags] = useState<DietaryFlag[]>(
    item.dietary_flags ?? []
  );
  const [allergens, setAllergens] = useState<Allergen[]>(
    item.allergens ?? []
  );
  const [portionNotes, setPortionNotes] = useState(item.portion_notes ?? "");
  const [prepNotes, setPrepNotes] = useState(item.prep_notes ?? "");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  async function handleSave() {
    setSaving(true);
    const res = await fetch(
      `/api/menus/${menuId}/sections/${sectionId}/items/${item.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          dietary_flags: dietaryFlags,
          allergens,
          portion_notes: portionNotes.trim() || null,
          prep_notes: prepNotes.trim() || null,
        }),
      }
    );

    if (res.ok) {
      const updated = await res.json();
      onUpdate({
        ...item,
        ...updated,
        menu_item_alternatives: item.menu_item_alternatives,
      });
    }
    setSaving(false);
  }

  async function handleDelete() {
    const res = await fetch(
      `/api/menus/${menuId}/sections/${sectionId}/items/${item.id}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      onDelete(item.id);
    }
  }

  function toggleDietaryFlag(flag: DietaryFlag) {
    setDietaryFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  }

  function toggleAllergen(allergen: Allergen) {
    setAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  }

  // Alternatives
  const alternatives = item.menu_item_alternatives ?? [];
  const availableForAlt = allItems.filter(
    (i) =>
      i.id !== item.id &&
      !alternatives.some((a) => a.alternative_item_id === i.id)
  );

  async function handleAddAlternative(altItemId: string | null) {
    if (!altItemId) return;

    const res = await fetch(`/api/menu-items/${item.id}/alternatives`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alternative_item_id: altItemId }),
    });

    if (res.ok) {
      const alt = await res.json();
      onUpdate({
        ...item,
        menu_item_alternatives: [...alternatives, alt],
      });
    }
  }

  async function handleRemoveAlternative(altItemId: string) {
    const res = await fetch(
      `/api/menu-items/${item.id}/alternatives/${altItemId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      onUpdate({
        ...item,
        menu_item_alternatives: alternatives.filter(
          (a) => a.alternative_item_id !== altItemId
        ),
      });
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-md border border-zinc-100 dark:border-zinc-800"
    >
      {/* Collapsed row */}
      <div className="flex items-center gap-2 px-2 py-1.5">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-zinc-300 hover:text-zinc-500 dark:hover:text-zinc-400"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
              {item.name}
            </span>
            {/* Dietary flags */}
            {item.dietary_flags?.map((flag) => {
              const config = DIETARY_FLAGS.find((f) => f.value === flag);
              return config ? (
                <span
                  key={flag}
                  className={`shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold ${config.color}`}
                >
                  {config.label}
                </span>
              ) : null;
            })}
          </div>
          {item.description && (
            <p className="truncate text-xs text-zinc-500">{item.description}</p>
          )}
          {/* Allergen badges */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="mt-0.5 flex flex-wrap gap-1">
              {item.allergens.map((a) => {
                const config = ALLERGENS.find((al) => al.value === a);
                return (
                  <span
                    key={a}
                    className="rounded bg-red-50 px-1 py-0.5 text-[10px] text-red-600 dark:bg-red-950/40 dark:text-red-400"
                  >
                    {config?.label ?? a}
                  </span>
                );
              })}
            </div>
          )}
          {/* Alternatives summary */}
          {alternatives.length > 0 && (
            <p className="mt-0.5 text-[10px] text-zinc-400">
              Alt:{" "}
              {alternatives
                .map(
                  (a) =>
                    a.alternative_item?.name ??
                    (a as unknown as { alternative_item: { name: string } })
                      .alternative_item?.name
                )
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 shrink-0 p-0 text-zinc-300 hover:text-red-600"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Expanded edit view */}
      {expanded && (
        <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Portion notes</Label>
                <Input
                  value={portionNotes}
                  onChange={(e) => setPortionNotes(e.target.value)}
                  placeholder="e.g. 2 pieces per person"
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the dish..."
                className="mt-1 text-sm"
                rows={2}
              />
            </div>

            {/* Dietary flags */}
            <div>
              <Label className="text-xs">Dietary flags</Label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {DIETARY_FLAGS.map((flag) => (
                  <button
                    key={flag.value}
                    type="button"
                    onClick={() => toggleDietaryFlag(flag.value)}
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                      dietaryFlags.includes(flag.value)
                        ? flag.color
                        : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                    }`}
                  >
                    {flag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergens */}
            <div>
              <Label className="text-xs">
                Allergens (14 UK allergens)
              </Label>
              <div className="mt-1 grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-7">
                {ALLERGENS.map((allergen) => (
                  <label
                    key={allergen.value}
                    className={`flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-[11px] transition-colors ${
                      allergens.includes(allergen.value)
                        ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        : "bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allergens.includes(allergen.value)}
                      onChange={() => toggleAllergen(allergen.value)}
                      className="h-3 w-3 rounded border-zinc-300"
                    />
                    {allergen.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Prep notes</Label>
              <Textarea
                value={prepNotes}
                onChange={(e) => setPrepNotes(e.target.value)}
                placeholder="Kitchen prep instructions..."
                className="mt-1 text-sm"
                rows={2}
              />
            </div>

            {/* Alternatives */}
            <div>
              <Label className="text-xs">Alternatives</Label>
              {alternatives.length > 0 && (
                <div className="mt-1 space-y-1">
                  {alternatives.map((alt) => {
                    const altItem = alt.alternative_item as
                      | { id: string; name: string }
                      | undefined;
                    return (
                      <div
                        key={alt.id}
                        className="flex items-center gap-2 rounded bg-zinc-50 px-2 py-1 text-xs dark:bg-zinc-800/50"
                      >
                        <span className="flex-1 text-zinc-700 dark:text-zinc-300">
                          {altItem?.name ?? "Unknown"}
                        </span>
                        <button
                          onClick={() =>
                            handleRemoveAlternative(alt.alternative_item_id)
                          }
                          className="text-zinc-400 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {availableForAlt.length > 0 && (
                <div className="mt-2">
                  <SearchableSelect
                    value={null}
                    onChange={handleAddAlternative}
                    options={availableForAlt.map((i) => ({
                      value: i.id,
                      label: i.name,
                    }))}
                    placeholder="Link an alternative..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !name.trim()}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  // Reset to original values
                  setName(item.name);
                  setDescription(item.description ?? "");
                  setDietaryFlags(item.dietary_flags ?? []);
                  setAllergens(item.allergens ?? []);
                  setPortionNotes(item.portion_notes ?? "");
                  setPrepNotes(item.prep_notes ?? "");
                  setExpanded(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
