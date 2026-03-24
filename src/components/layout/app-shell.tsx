"use client";

import { useState } from "react";
import { TopBar } from "./top-bar";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <TopBar onMenuToggle={() => setMobileNavOpen((prev) => !prev)} />
      <Sidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      {/* Main content — offset for top bar (h-14) and sidebar (w-60 on md+) */}
      <main className="px-4 pt-14 md:pl-64 md:pr-6">
        <div className="mx-auto max-w-5xl py-6">{children}</div>
      </main>
    </div>
  );
}
