"use client";

import { Menu } from "lucide-react";
import { UserMenu } from "./user-menu";

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
          CaterPlan
        </span>
      </div>
      <UserMenu />
    </header>
  );
}
