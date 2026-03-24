-- CaterPlan: Auth & Multi-Tenancy Migration
-- Run this in the Supabase SQL Editor

-- =============================================================================
-- 1. Organisations table
-- =============================================================================

CREATE TABLE organisations (
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

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id),
  full_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'view-only' CHECK (role IN ('admin', 'event-manager', 'kitchen', 'view-only')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 3. Auto-create profile on sign-up
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- 4. Row-Level Security — Organisations
-- =============================================================================

ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own organisation
CREATE POLICY "Users can view own organisation"
  ON organisations FOR SELECT
  USING (
    id IN (
      SELECT organisation_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Only admins can update their organisation
CREATE POLICY "Admins can update own organisation"
  ON organisations FOR UPDATE
  USING (
    id IN (
      SELECT organisation_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Any authenticated user can create an organisation (for onboarding)
CREATE POLICY "Authenticated users can create organisations"
  ON organisations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- 5. Row-Level Security — Profiles
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can see profiles in their organisation
CREATE POLICY "Users can view profiles in own organisation"
  ON profiles FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Profile creation is handled by the trigger (SECURITY DEFINER),
-- but also allow direct insert for onboarding
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());
