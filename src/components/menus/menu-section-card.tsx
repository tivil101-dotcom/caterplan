"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import type { MenuSection, MenuItem } from "@/lib/menus/types";
import { MenuItemRow } from "./menu-item-row";

interface MenuSectionCardProps {
  section: MenuSection;
  menuId: string;
  allSections: MenuSection[];
  onUpdate: (section: MenuSection) => void;
  onDelete: (sectionId: string) => void;
}

export function MenuSectionCard({
  section,
  menuId,
  allSections,
  onUpdate,
  onDelete,
}: MenuSectionCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(section.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const items = section.menu_items ?? [];

  async function handleNameSave() {
    if (!nameValue.trim() || nameValue.trim() === section.name) {
      setEditingName(false);
      setNameValue(section.name);
      return;
    }

    const res = await fetch(
      `/api/menus/${menuId}/sections/${section.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue.trim() }),
      }
    );

    if (res.ok) {
      onUpdate({ ...section, name: nameValue.trim() });
    }
    setEditingName(false);
  }

  async function handleDelete() {
    const res = await fetch(
      `/api/menus/${menuId}/sections/${section.id}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      onDelete(section.id);
    }
  }

  async function handleAddItem() {
    const res = await fetch(
      `/api/menus/${menuId}/sections/${section.id}/items`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Item" }),
      }
    );

    if (res.ok) {
      const item = await res.json();
      onUpdate({
        ...section,
        menu_items: [...items, item],
      });
    }
  }

  function handleItemUpdate(updated: MenuItem) {
    onUpdate({
      ...section,
      menu_items: items.map((i) => (i.id === updated.id ? updated : i)),
    });
  }

  function handleItemDelete(itemId: string) {
    onUpdate({
      ...section,
      menu_items: items.filter((i) => i.id !== itemId),
    });
  }

  async function handleItemDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updated = reordered.map((item, i) => ({ ...item, sort_order: i }));
    onUpdate({ ...section, menu_items: updated });

    await fetch(
      `/api/menus/${menuId}/sections/${section.id}/items/reorder`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updated.map((i) => ({ id: i.id, sort_order: i.sort_order })),
        }),
      }
    );
  }

  // Collect all items across all sections for alternatives selection
  const allItems = allSections.flatMap((s) => s.menu_items ?? []);

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 py-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
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
                    setNameValue(section.name);
                  }
                }}
                autoFocus
                className="h-7 text-sm font-semibold"
              />
            ) : (
              <CardTitle
                className="cursor-pointer text-sm hover:text-zinc-600 dark:hover:text-zinc-300"
                onClick={() => setEditingName(true)}
                title="Click to edit"
              >
                {section.name}
                <span className="ml-2 text-xs font-normal text-zinc-400">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </CardTitle>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>

        {showDeleteConfirm && (
          <div className="mx-4 mb-3 rounded-md border border-red-200 bg-red-50 p-2 dark:border-red-900 dark:bg-red-950/30">
            <p className="text-xs text-red-700 dark:text-red-300">
              Delete &quot;{section.name}&quot; and all its items?
            </p>
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

        {!collapsed && (
          <CardContent className="pt-0">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleItemDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {items.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      menuId={menuId}
                      sectionId={section.id}
                      allItems={allItems}
                      onUpdate={handleItemUpdate}
                      onDelete={handleItemDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs text-zinc-500"
              onClick={handleAddItem}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add item
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
