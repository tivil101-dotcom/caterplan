"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SERVICE_STYLES } from "@/lib/menus/types";
import type { Menu, MenuSection, ServiceStyle } from "@/lib/menus/types";
import { MenuSectionCard } from "./menu-section-card";

interface MenuEditorProps {
  menuId: string;
}

export function MenuEditor({ menuId }: MenuEditorProps) {
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchMenu = useCallback(async () => {
    const res = await fetch(`/api/menus/${menuId}`);
    if (!res.ok) {
      router.push("/menus");
      return;
    }
    const data = await res.json();
    setMenu(data);
    setNameValue(data.name);
    setLoading(false);
  }, [menuId, router]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  async function handleNameSave() {
    if (!nameValue.trim() || nameValue.trim() === menu?.name) {
      setEditingName(false);
      setNameValue(menu?.name ?? "");
      return;
    }

    await fetch(`/api/menus/${menuId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameValue.trim() }),
    });

    setMenu((prev) => (prev ? { ...prev, name: nameValue.trim() } : prev));
    setEditingName(false);
  }

  async function handleStyleChange(style: string) {
    await fetch(`/api/menus/${menuId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_style: style || null }),
    });

    setMenu((prev) =>
      prev
        ? { ...prev, service_style: (style as ServiceStyle) || null }
        : prev
    );
  }

  async function handleAddSection() {
    const res = await fetch(`/api/menus/${menuId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Section" }),
    });

    if (res.ok) {
      const section = await res.json();
      setMenu((prev) =>
        prev
          ? {
              ...prev,
              menu_sections: [...(prev.menu_sections ?? []), section],
            }
          : prev
      );
    }
  }

  async function handleDeleteMenu() {
    setIsDeleting(true);
    const res = await fetch(`/api/menus/${menuId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/menus");
    } else {
      setIsDeleting(false);
    }
  }

  function handleSectionUpdate(updated: MenuSection) {
    setMenu((prev) =>
      prev
        ? {
            ...prev,
            menu_sections: prev.menu_sections?.map((s) =>
              s.id === updated.id ? updated : s
            ),
          }
        : prev
    );
  }

  function handleSectionDelete(sectionId: string) {
    setMenu((prev) =>
      prev
        ? {
            ...prev,
            menu_sections: prev.menu_sections?.filter(
              (s) => s.id !== sectionId
            ),
          }
        : prev
    );
  }

  async function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !menu?.menu_sections) return;

    const oldIndex = menu.menu_sections.findIndex((s) => s.id === active.id);
    const newIndex = menu.menu_sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...menu.menu_sections];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updated = reordered.map((s, i) => ({ ...s, sort_order: i }));
    setMenu((prev) => (prev ? { ...prev, menu_sections: updated } : prev));

    await fetch(`/api/menus/${menuId}/sections/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sections: updated.map((s) => ({ id: s.id, sort_order: s.sort_order })),
      }),
    });
  }

  if (loading || !menu) {
    return (
      <div className="py-12 text-center text-sm text-zinc-400">
        Loading menu...
      </div>
    );
  }

  const sections = menu.menu_sections ?? [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/menus"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to menus
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          {editingName ? (
            <Input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameSave();
                if (e.key === "Escape") {
                  setEditingName(false);
                  setNameValue(menu.name);
                }
              }}
              autoFocus
              className="text-2xl font-bold"
            />
          ) : (
            <h1
              className="cursor-pointer text-2xl font-bold text-zinc-900 hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300"
              onClick={() => setEditingName(true)}
              title="Click to edit name"
            >
              {menu.name}
            </h1>
          )}
          <div className="mt-2 flex items-center gap-3">
            <select
              value={menu.service_style ?? ""}
              onChange={(e) => handleStyleChange(e.target.value)}
              className="h-8 rounded-lg border border-input bg-transparent px-2 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-zinc-900"
            >
              <option value="">No service style</option>
              {SERVICE_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Delete menu
        </Button>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Delete this menu and all its sections/items? This cannot be undone.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 bg-red-100 text-red-700 hover:bg-red-200 dark:border-red-800 dark:bg-red-900 dark:text-red-200"
              onClick={handleDeleteMenu}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, delete"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleSectionDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {sections.map((section) => (
              <MenuSectionCard
                key={section.id}
                section={section}
                menuId={menuId}
                allSections={sections}
                onUpdate={handleSectionUpdate}
                onDelete={handleSectionDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-zinc-300 py-12 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-500">No sections yet</p>
          <p className="mt-1 text-xs text-zinc-400">
            Add a section to start building your menu
          </p>
        </div>
      )}

      <Button variant="outline" onClick={handleAddSection}>
        <Plus className="mr-1 h-4 w-4" />
        Add section
      </Button>
    </div>
  );
}
