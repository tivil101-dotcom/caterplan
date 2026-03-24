-- Hotfix: Fix handle_new_user trigger and profiles SELECT policy
-- Run this in the Supabase SQL Editor IMMEDIATELY
--
-- Fixes two issues:
-- 1. Trigger function had no SET search_path and used unqualified table name,
--    causing it to fail under the supabase_auth_admin role context.
-- 2. Profiles SELECT policy was self-referencing and blocked new users with
--    NULL organisation_id from reading their own profile.

-- =============================================================================
-- Fix 1: Replace the trigger function with search_path and qualified names
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- =============================================================================
-- Fix 2: Add a policy so users can always read their own profile
-- =============================================================================

-- Drop the old self-referencing policy and replace it
DROP POLICY IF EXISTS "Users can view profiles in own organisation" ON public.profiles;

-- Users can always read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Users can see other profiles in their organisation (fixed NULL handling)
CREATE POLICY "Users can view profiles in own organisation"
  ON public.profiles FOR SELECT
  USING (
    organisation_id IS NOT NULL
    AND organisation_id IN (
      SELECT organisation_id FROM public.profiles WHERE id = auth.uid()
    )
  );
