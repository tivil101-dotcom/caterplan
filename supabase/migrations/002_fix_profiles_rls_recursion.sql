-- Hotfix: Replace the self-referencing profiles SELECT policy with one
-- that uses a SECURITY DEFINER helper function to avoid infinite recursion.
--
-- Run this in the Supabase SQL Editor.

-- 1. Create the helper function (bypasses RLS to get the caller's org ID)
CREATE OR REPLACE FUNCTION public.get_user_organisation_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT organisation_id FROM public.profiles WHERE id = auth.uid()
$$;

-- 2. Drop the recursive policy
DROP POLICY IF EXISTS "Users can view profiles in own organisation" ON public.profiles;

-- 3. Re-create it using the helper function instead of a subquery
CREATE POLICY "Users can view profiles in own organisation"
  ON public.profiles FOR SELECT
  USING (
    organisation_id IS NOT NULL
    AND organisation_id = public.get_user_organisation_id()
  );
