"use client";

import { UserMenu } from "./user-menu";

export function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
        CaterPlan
      </span>
      <UserMenu />
    </header>
  );
}
