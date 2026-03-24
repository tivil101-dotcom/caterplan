"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [orgName, setOrgName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!orgName.trim()) {
      setError("Organisation name is required.");
      return;
    }

    if (!user) {
      setError("You must be signed in.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();

    // Generate org ID client-side so we don't need a SELECT after INSERT.
    // The organisations SELECT policy requires the user's profile to already
    // reference the org, but the profile update happens after the insert,
    // so .select("id") would be blocked by RLS.
    const orgId = crypto.randomUUID();

    // 1. Create the organisation
    const { error: orgError } = await supabase
      .from("organisations")
      .insert({ id: orgId, name: orgName.trim() });

    if (orgError) {
      console.error("Org insert error:", orgError);
      setError(`Failed to create organisation: ${orgError.message}`);
      setIsSubmitting(false);
      return;
    }

    // 2. Update the user's profile with the org ID and set as admin.
    // Use upsert so it works whether the trigger already created the
    // profile or not — avoids the SELECT-then-branch pattern that can
    // fail when RLS hides the existing row.
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          full_name:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            "",
          organisation_id: orgId,
          role: "admin",
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.error("Profile upsert error:", profileError);
      setError(`Failed to update profile: ${profileError.message}`);
      setIsSubmitting(false);
      return;
    }

    // 3. Refresh auth context and redirect
    await refreshProfile();
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create your organisation</CardTitle>
          <p className="text-sm text-zinc-500">
            Set up your catering company to get started with CaterPlan.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organisation name</Label>
              <Input
                id="orgName"
                placeholder="e.g. Jimmy Garcia Catering"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create organisation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
