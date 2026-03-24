"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/lib/auth/types";

interface DashboardContentProps {
  userName: string;
  userEmail: string;
  userRole: Profile["role"];
  organisationName: string;
}

export function DashboardContent({
  userName,
  userEmail,
  userRole,
  organisationName,
}: DashboardContentProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        Dashboard
      </h1>
      <p className="mt-1 text-zinc-500">Welcome back, {userName}</p>

      <Card className="mt-6 max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Your profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium text-zinc-500">Email:</span>{" "}
            {userEmail}
          </p>
          <p>
            <span className="font-medium text-zinc-500">Role:</span>{" "}
            {userRole}
          </p>
          <p>
            <span className="font-medium text-zinc-500">Organisation:</span>{" "}
            {organisationName}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
