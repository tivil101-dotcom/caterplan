"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, UtensilsCrossed } from "lucide-react";
import { SERVICE_STYLES, type Menu, type ServiceStyle } from "@/lib/menus/types";

export function MenuList() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [styleFilter, setStyleFilter] = useState("all");

  // Create menu modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStyle, setNewStyle] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchMenus = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (styleFilter !== "all") params.set("service_style", styleFilter);

    const res = await fetch(`/api/menus?${params}`);
    const data = await res.json();
    if (Array.isArray(data)) setMenus(data);
    setLoading(false);
  }, [search, styleFilter]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(fetchMenus, 300);
    return () => clearTimeout(timer);
  }, [fetchMenus]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setIsCreating(true);

    const res = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        service_style: newStyle || null,
      }),
    });

    if (res.ok) {
      const menu = await res.json();
      // Navigate to the editor
      window.location.href = `/menus/${menu.id}`;
    }
    setIsCreating(false);
  }

  const getSectionCount = (menu: Menu) =>
    (menu as Menu & { menu_sections?: { id: string; menu_items?: { id: string }[] }[] })
      .menu_sections?.length ?? 0;

  const getItemCount = (menu: Menu) =>
    (menu as Menu & { menu_sections?: { id: string; menu_items?: { id: string }[] }[] })
      .menu_sections?.reduce(
        (sum, s) => sum + (s.menu_items?.length ?? 0),
        0
      ) ?? 0;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Menus
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Menu templates — reusable starting points for events
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Create menu
        </Button>
      </div>

      {/* Create menu inline form */}
      {showCreate && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">New menu template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Menu name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={isCreating}
                className="flex-1"
                autoFocus
              />
              <select
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
                disabled={isCreating}
                className="h-9 rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-zinc-900"
              >
                <option value="">No service style</option>
                {SERVICE_STYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={isCreating || !newName.trim()}
                >
                  {isCreating ? "Creating..." : "Create"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowCreate(false);
                    setNewName("");
                    setNewStyle("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and filter */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search menus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={styleFilter}
          onChange={(e) => setStyleFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-zinc-900"
        >
          <option value="all">All styles</option>
          {SERVICE_STYLES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Menu list */}
      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="py-8 text-center text-sm text-zinc-400">Loading...</p>
        ) : menus.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <UtensilsCrossed className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500">No menus yet</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setShowCreate(true)}
            >
              Create your first menu
            </Button>
          </div>
        ) : (
          menus.map((menu) => {
            const sections = getSectionCount(menu);
            const items = getItemCount(menu);
            const styleLabel = SERVICE_STYLES.find(
              (s) => s.value === menu.service_style
            )?.label;

            return (
              <Link
                key={menu.id}
                href={`/menus/${menu.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-zinc-900 dark:text-white">
                    {menu.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {sections} {sections === 1 ? "section" : "sections"} ·{" "}
                    {items} {items === 1 ? "item" : "items"}
                  </p>
                </div>
                {styleLabel && (
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {styleLabel}
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
