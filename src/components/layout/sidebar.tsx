"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

interface SidebarProps {
  /** Mobile overlay mode — controlled by the top bar hamburger */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const navContent = (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:top-14 md:border-r md:border-zinc-200 md:bg-white dark:md:border-zinc-800 dark:md:bg-zinc-950">
        {navContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          {/* Slide-in panel */}
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white pt-14 shadow-xl animate-in slide-in-from-left duration-200 dark:border-zinc-800 dark:bg-zinc-950">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
