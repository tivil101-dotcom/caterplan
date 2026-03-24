-- CaterPlan: Auth & Multi-Tenancy Migration
-- Run this in the Supabase SQL Editor

-- =============================================================================
-- 1. Organisations table
-- =============================================================================

CREATE TABLE public.organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 2. Profiles table (extends auth.users)
-- =============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES public.organisations(id),
  full_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'view-only' CHECK (role IN ('admin', 'event-manager', 'kitchen', 'view-only')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 3. Auto-create profile on sign-up
-- =============================================================================

-- SET search_path = '' prevents search-path injection and ensures the function
-- uses fully-qualified table names. This is required for SECURITY DEFINER
-- functions that run from Supabase's auth service (supabase_auth_admin role).

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 4. Row-Level Security — Organisations
-- =============================================================================

ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own organisation
CREATE POLICY "Users can view own organisation"
  ON public.organisations FOR SELECT
  USING (
    id IN (
      SELECT organisation_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Only admins can update their organisation
CREATE POLICY "Admins can update own organisation"
  ON public.organisations FOR UPDATE
  USING (
    id IN (
      SELECT organisation_id FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Any authenticated user can create an organisation (for onboarding)
CREATE POLICY "Authenticated users can create organisations"
  ON public.organisations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- 5. Helper function to get the current user's organisation_id
-- =============================================================================

-- SECURITY DEFINER so this bypasses RLS — avoids infinite recursion when
-- profiles policies need to know the caller's org.
CREATE OR REPLACE FUNCTION public.get_user_organisation_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT organisation_id FROM public.profiles WHERE id = auth.uid()
$$;

-- =============================================================================
-- 6. Row-Level Security — Profiles
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can always read their own profile (needed for auth context, onboarding check)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Users can see other profiles in their organisation.
-- Uses the helper function instead of a subquery to avoid infinite recursion.
CREATE POLICY "Users can view profiles in own organisation"
  ON public.profiles FOR SELECT
  USING (
    organisation_id IS NOT NULL
    AND organisation_id = public.get_user_organisation_id()
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Profile creation is handled by the trigger (SECURITY DEFINER),
-- but also allow direct insert for onboarding
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());
