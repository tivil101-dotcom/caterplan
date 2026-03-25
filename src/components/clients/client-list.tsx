"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Mail, Phone, Plus, Search, Users } from "lucide-react";
import type { Client } from "@/lib/clients/types";

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    const timer = setTimeout(() => {
      fetch(`/api/clients?${params}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setClients(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Clients
        </h1>
        <Link href="/clients/new">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New client
          </Button>
        </Link>
      </div>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Users className="mb-2 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500">
              {search ? "No clients match your search" : "No clients yet"}
            </p>
            {!search && (
              <Link href="/clients/new">
                <Button size="sm" variant="outline" className="mt-3">
                  Add your first client
                </Button>
              </Link>
            )}
          </div>
        ) : (
          clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="block rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="font-medium text-zinc-900 dark:text-white">
                {client.name}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                {client.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {client.company}
                  </span>
                )}
                {client.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {client.email}
                  </span>
                )}
                {client.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {client.phone}
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
