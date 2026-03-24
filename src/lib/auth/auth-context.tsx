"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Organisation, Profile } from "./types";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  organisation: Organisation | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stable reference — createBrowserClient caches internally, but wrapping
  // in useMemo avoids a new object reference on every render which would
  // invalidate useCallback/useEffect dependencies.
  const supabase = useMemo(() => createClient(), []);

  const fetchProfileAndOrg = useCallback(
    async (userId: string) => {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.warn("Failed to fetch profile:", profileError.message);
        return;
      }

      if (profileData) {
        setProfile(profileData as Profile);

        if (profileData.organisation_id) {
          const { data: orgData, error: orgError } = await supabase
            .from("organisations")
            .select("*")
            .eq("id", profileData.organisation_id)
            .single();

          if (orgError) {
            console.warn("Failed to fetch organisation:", orgError.message);
          } else if (orgData) {
            setOrganisation(orgData as Organisation);
          }
        } else {
          setOrganisation(null);
        }
      }
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfileAndOrg(user.id);
    }
  }, [user, fetchProfileAndOrg]);

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error || !currentUser) {
        setIsLoading(false);
        return;
      }

      setUser(currentUser);
      await fetchProfileAndOrg(currentUser.id);
      setIsLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        await fetchProfileAndOrg(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setOrganisation(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfileAndOrg]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // Hard redirect — router.push() does a soft client-side navigation
    // which keeps the cached server component output (protected layout
    // doesn't re-run), so the page appears to do nothing. A full page
    // load ensures cookies are cleared and the server re-checks auth.
    window.location.href = "/";
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, organisation, isLoading, signOut, refreshProfile }),
    [user, profile, organisation, isLoading, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
