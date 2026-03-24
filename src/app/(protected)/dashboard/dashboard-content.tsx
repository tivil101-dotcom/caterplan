"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
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
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to CaterPlan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium text-zinc-500">Name:</span>{" "}
              {userName}
            </p>
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
          </div>
          <Button variant="outline" className="w-full" onClick={signOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
