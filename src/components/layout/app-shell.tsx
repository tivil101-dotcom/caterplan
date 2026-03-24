"use client";

import { TopBar } from "./top-bar";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <TopBar />
      <Sidebar />

      {/* Main content — offset for top bar (h-14) and sidebar (w-60 on md+) */}
      <main className="pt-14 pb-20 px-4 md:pl-64 md:pr-6 md:pb-6">
        <div className="mx-auto max-w-5xl py-6">{children}</div>
      </main>

      <BottomNav />
    </div>
  );
}
