"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  Copy,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DIETARY_FLAGS,
  ALLERGENS,
  ALTERNATIVE_REASONS,
  type MenuItem,
  type MenuSection,
  type DietaryFlag,
  type Allergen,
  type AlternativeReason,
  type ReverseAlternative,
} from "@/lib/menus/types";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface MenuItemRowProps {
  item: MenuItem & { _isNew?: boolean };
  menuId: string;
  sectionId: string;
  allItems: MenuItem[];
  allSections: MenuSection[];
  onUpdate: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onDuplicate: (item: MenuItem, targetSectionId?: string) => void;
  onRefreshMenu: () => void;
}

export function MenuItemRow({
  item,
  menuId,
  sectionId,
  allItems,
  allSections,
  onUpdate,
  onDelete,
  onDuplicate,
  onRefreshMenu,
}: MenuItemRowProps) {
  // Auto-expand new items (those with _isNew flag or empty name)
  const [expanded, setExpanded] = useState(
    !!(item as { _isNew?: boolean })._isNew || !item.name
  );
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDuplicateMenu, setShowDuplicateMenu] = useState(false);

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

  // Alternative reason state
  const [altReason, setAltReason] = useState<AlternativeReason | "">("");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  // Fix #4: Auto-collapse on drag start
  useEffect(() => {
    if (isDragging && expanded) {
      setExpanded(false);
    }
  }, [isDragging]); // eslint-disable-line react-hooks/exhaustive-deps

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  async function handleSave() {
    // Fix #1: Validate name required
    if (!name.trim()) return;

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
        reverse_alternatives: item.reverse_alternatives,
      });
      // Fix #2: Collapse on save
      setExpanded(false);
    }
    setSaving(false);
  }

  // Fix #7 & #8: Delete with confirmation showing alternative links
  async function handleDelete() {
    const res = await fetch(
      `/api/menus/${menuId}/sections/${sectionId}/items/${item.id}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      onDelete(item.id);
      setShowDeleteConfirm(false);
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

  // Alternatives (forward: this item has alternatives)
  const alternatives = item.menu_item_alternatives ?? [];
  // Reverse alternatives (this item IS an alternative for another)
  const reverseAlts = (item.reverse_alternatives ?? []) as ReverseAlternative[];

  const availableForAlt = allItems.filter(
    (i) =>
      i.id !== item.id &&
      !alternatives.some((a) => a.alternative_item_id === i.id)
  );

  // Fix #6: Add alternative with reason
  async function handleAddAlternative(altItemId: string | null) {
    if (!altItemId) return;

    const res = await fetch(`/api/menu-items/${item.id}/alternatives`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alternative_item_id: altItemId,
        reason: altReason || null,
      }),
    });

    if (res.ok) {
      const alt = await res.json();
      onUpdate({
        ...item,
        menu_item_alternatives: [...alternatives, alt],
      });
      setAltReason("");
      // Refresh to update reverse links on the other item
      onRefreshMenu();
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
      onRefreshMenu();
    }
  }

  // Items this is linked as alt for — find which items have alt links pointing to us
  const linkedAsAltFor = reverseAlts.map((ra) => ra.source_item?.name).filter(Boolean);

  // Display name or placeholder
  const displayName = item.name || "Untitled item";

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
            <span
              className={`truncate text-sm font-medium ${
                item.name
                  ? "text-zinc-900 dark:text-white"
                  : "italic text-zinc-400"
              }`}
            >
              {displayName}
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
          {/* Forward alternatives summary */}
          {alternatives.length > 0 && (
            <p className="mt-0.5 text-[10px] text-zinc-400">
              Alt:{" "}
              {alternatives
                .map((a) => {
                  const altName = a.alternative_item?.name ?? "Unknown";
                  const reasonLabel = a.reason
                    ? ALTERNATIVE_REASONS.find((r) => r.value === a.reason)
                        ?.label
                    : null;
                  return reasonLabel ? `${altName} (${reasonLabel})` : altName;
                })
                .join(", ")}
            </p>
          )}
          {/* Fix #5: Reverse alternatives — show "Alt for: ..." */}
          {reverseAlts.length > 0 && (
            <p className="mt-0.5 text-[10px] text-blue-500">
              Alt for:{" "}
              {reverseAlts.map((ra) => ra.source_item?.name ?? "Unknown").join(", ")}
            </p>
          )}
        </div>
        {/* Fix #3: Duplicate button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 shrink-0 p-0 text-zinc-300 hover:text-zinc-600"
            onClick={(e) => {
              e.stopPropagation();
              setShowDuplicateMenu(!showDuplicateMenu);
            }}
            title="Duplicate"
          >
            <Copy className="h-3 w-3" />
          </Button>
          {showDuplicateMenu && (
            <div className="absolute right-0 top-7 z-20 w-48 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              <button
                className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => {
                  onDuplicate(item);
                  setShowDuplicateMenu(false);
                }}
              >
                Duplicate in this section
              </button>
              {allSections
                .filter((s) => s.id !== sectionId)
                .map((s) => (
                  <button
                    key={s.id}
                    className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => {
                      onDuplicate(item, s.id);
                      setShowDuplicateMenu(false);
                    }}
                  >
                    Duplicate to &quot;{s.name}&quot;
                  </button>
                ))}
            </div>
          )}
        </div>
        {/* Fix #7: Delete with confirmation */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 shrink-0 p-0 text-zinc-300 hover:text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="mx-2 mb-2 rounded-md border border-red-200 bg-red-50 p-2 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-xs text-red-700 dark:text-red-300">
            Delete &quot;{displayName}&quot;?
          </p>
          {linkedAsAltFor.length > 0 && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              This item is linked as an alternative to:{" "}
              <strong>{linkedAsAltFor.join(", ")}</strong>. Deleting it will
              remove those links.
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-6 border-red-300 bg-red-100 px-2 text-xs text-red-700 hover:bg-red-200"
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Expanded edit view */}
      {expanded && (
        <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                {/* Fix #1: Name with asterisk and placeholder */}
                <Label className="text-xs">Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter item name..."
                  className="mt-1 h-8 text-sm"
                  autoFocus={!item.name}
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
              <Label className="text-xs">Allergens (14 UK allergens)</Label>
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
                    const altItem = alt.alternative_item;
                    const reasonLabel = alt.reason
                      ? ALTERNATIVE_REASONS.find((r) => r.value === alt.reason)
                          ?.label
                      : null;
                    return (
                      <div
                        key={alt.id}
                        className="flex items-center gap-2 rounded bg-zinc-50 px-2 py-1 text-xs dark:bg-zinc-800/50"
                      >
                        <span className="flex-1 text-zinc-700 dark:text-zinc-300">
                          {altItem?.name ?? "Unknown"}
                        </span>
                        {reasonLabel && (
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                            {reasonLabel}
                          </span>
                        )}
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

              {/* Fix #5: Show reverse alternatives */}
              {reverseAlts.length > 0 && (
                <div className="mt-1 space-y-1">
                  {reverseAlts.map((ra) => (
                    <div
                      key={ra.id}
                      className="flex items-center gap-2 rounded bg-blue-50/50 px-2 py-1 text-xs dark:bg-blue-950/20"
                    >
                      <span className="flex-1 text-blue-700 dark:text-blue-400">
                        Alternative for: {ra.source_item?.name ?? "Unknown"}
                      </span>
                      {ra.reason && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                          {ALTERNATIVE_REASONS.find((r) => r.value === ra.reason)?.label ?? ra.reason}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Fix #6: Add alternative with reason selector */}
              {availableForAlt.length > 0 && (
                <div className="mt-2 flex gap-2">
                  <div className="flex-1">
                    <SearchableSelect
                      value={null}
                      onChange={handleAddAlternative}
                      options={availableForAlt.map((i) => ({
                        value: i.id,
                        label: i.name || "Untitled",
                      }))}
                      placeholder="Link an alternative..."
                    />
                  </div>
                  <select
                    value={altReason}
                    onChange={(e) =>
                      setAltReason(e.target.value as AlternativeReason | "")
                    }
                    className="h-9 rounded-lg border border-input bg-transparent px-2 py-1 text-xs outline-none focus-visible:border-ring dark:bg-zinc-900"
                  >
                    <option value="">Reason</option>
                    {ALTERNATIVE_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
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
