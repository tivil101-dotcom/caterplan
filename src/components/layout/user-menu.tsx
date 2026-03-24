"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserMenu() {
  const { user, profile, organisation, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name ?? user?.email ?? "User";
  const displayEmail = profile?.email ?? user?.email ?? "";
  const orgName = organisation?.name ?? "No organisation";

  const handleClose = useCallback(() => setOpen(false), []);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, handleClose]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-700 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-700 dark:text-zinc-200"
      >
        {getInitials(profile?.full_name ?? null)}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {displayName}
            </p>
            <p className="text-xs text-zinc-500">{displayEmail}</p>
            <p className="text-xs text-zinc-400">{orgName}</p>
          </div>
          <div className="mx-2 border-t border-zinc-200 dark:border-zinc-700" />
          <button
            onClick={() => {
              handleClose();
              signOut();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
