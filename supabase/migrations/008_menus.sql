-- CaterPlan: Menu Builder — Core tables
-- Run this in the Supabase SQL Editor
--
-- Creates: menus, menu_sections, menu_items, menu_item_alternatives
-- Supports both template menus and event-specific menus.

-- =============================================================================
-- 1. Menus table
-- =============================================================================

CREATE TABLE public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  menu_type TEXT NOT NULL DEFAULT 'food',
  service_style TEXT,
  is_template BOOLEAN NOT NULL DEFAULT true,
  event_service_id UUID REFERENCES public.event_services(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT menus_valid_type CHECK (menu_type IN ('food', 'drinks')),
  CONSTRAINT menus_valid_service_style CHECK (
    service_style IS NULL OR service_style IN ('plated', 'buffet', 'sharing', 'canapes', 'food_station')
  )
);

ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org menus"
  ON public.menus FOR SELECT
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can insert own org menus"
  ON public.menus FOR INSERT
  WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can update own org menus"
  ON public.menus FOR UPDATE
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can delete own org menus"
  ON public.menus FOR DELETE
  USING (organisation_id = public.get_user_organisation_id());

CREATE TRIGGER menus_set_updated_at
  BEFORE UPDATE ON public.menus
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 2. Menu sections table
-- =============================================================================

CREATE TABLE public.menu_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_menu_sections_menu_id ON public.menu_sections(menu_id);

ALTER TABLE public.menu_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org menu_sections"
  ON public.menu_sections FOR SELECT
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can insert own org menu_sections"
  ON public.menu_sections FOR INSERT
  WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can update own org menu_sections"
  ON public.menu_sections FOR UPDATE
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can delete own org menu_sections"
  ON public.menu_sections FOR DELETE
  USING (organisation_id = public.get_user_organisation_id());

CREATE TRIGGER menu_sections_set_updated_at
  BEFORE UPDATE ON public.menu_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 3. Menu items table
-- =============================================================================

CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  menu_section_id UUID NOT NULL REFERENCES public.menu_sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  dietary_flags TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  portion_notes TEXT,
  prep_notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_menu_items_section_id ON public.menu_items(menu_section_id);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org menu_items"
  ON public.menu_items FOR SELECT
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can insert own org menu_items"
  ON public.menu_items FOR INSERT
  WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can update own org menu_items"
  ON public.menu_items FOR UPDATE
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can delete own org menu_items"
  ON public.menu_items FOR DELETE
  USING (organisation_id = public.get_user_organisation_id());

CREATE TRIGGER menu_items_set_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 4. Menu item alternatives (junction table)
-- =============================================================================

CREATE TABLE public.menu_item_alternatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  alternative_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT menu_item_alternatives_unique_pair UNIQUE (menu_item_id, alternative_item_id),
  CONSTRAINT menu_item_alternatives_no_self CHECK (menu_item_id != alternative_item_id)
);

CREATE INDEX idx_menu_item_alternatives_item ON public.menu_item_alternatives(menu_item_id);
CREATE INDEX idx_menu_item_alternatives_alt ON public.menu_item_alternatives(alternative_item_id);

ALTER TABLE public.menu_item_alternatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org menu_item_alternatives"
  ON public.menu_item_alternatives FOR SELECT
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can insert own org menu_item_alternatives"
  ON public.menu_item_alternatives FOR INSERT
  WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can update own org menu_item_alternatives"
  ON public.menu_item_alternatives FOR UPDATE
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can delete own org menu_item_alternatives"
  ON public.menu_item_alternatives FOR DELETE
  USING (organisation_id = public.get_user_organisation_id());

-- =============================================================================
-- 5. PostgreSQL COMMENT statements
-- =============================================================================

COMMENT ON TABLE public.menus IS
  'A menu — either a reusable template or an event-specific menu linked to an event_service. Contains ordered sections of items. Supports food and drinks types, with service style (plated, buffet, sharing, canapes, food_station) as metadata.';

COMMENT ON COLUMN public.menus.id IS 'Primary key (UUID).';
COMMENT ON COLUMN public.menus.organisation_id IS 'The organisation this menu belongs to. Used for RLS tenant isolation.';
COMMENT ON COLUMN public.menus.name IS 'Display name of the menu, e.g. "Summer Wedding Dinner", "Canapé Selection".';
COMMENT ON COLUMN public.menus.description IS 'Optional description or notes about the menu.';
COMMENT ON COLUMN public.menus.menu_type IS 'Type of menu. One of: food, drinks. Default is food.';
COMMENT ON COLUMN public.menus.service_style IS 'Service style for this menu. One of: plated, buffet, sharing, canapes, food_station. NULL if not specified. Affects default section names when creating a new menu.';
COMMENT ON COLUMN public.menus.is_template IS 'Whether this is a reusable template (true) or an event-specific menu (false). Templates appear on the /menus page. Event menus are linked via event_service_id.';
COMMENT ON COLUMN public.menus.event_service_id IS 'For event-specific menus, the event service this menu is assigned to. NULL for templates. FK to event_services(id), SET NULL on delete.';
COMMENT ON COLUMN public.menus.created_at IS 'Timestamp when the menu was created.';
COMMENT ON COLUMN public.menus.updated_at IS 'Timestamp of the last update. Auto-set by trigger.';

COMMENT ON TABLE public.menu_sections IS
  'A section/course within a menu (e.g. Starter, Main, Dessert, Canapés, Late Night). Contains ordered menu items. Sort order determines display sequence.';

COMMENT ON COLUMN public.menu_sections.id IS 'Primary key (UUID).';
COMMENT ON COLUMN public.menu_sections.organisation_id IS 'The organisation this section belongs to. Used for RLS.';
COMMENT ON COLUMN public.menu_sections.menu_id IS 'The menu this section belongs to. Cascading delete — removing the menu removes all sections.';
COMMENT ON COLUMN public.menu_sections.name IS 'Name of the section, e.g. "Starter", "Main Course", "Dessert", "Canapés", "Late Night".';
COMMENT ON COLUMN public.menu_sections.sort_order IS 'Display order among the menu''s sections. 0-indexed.';
COMMENT ON COLUMN public.menu_sections.created_at IS 'Timestamp when this section was created.';
COMMENT ON COLUMN public.menu_sections.updated_at IS 'Timestamp of the last update. Auto-set by trigger.';

COMMENT ON TABLE public.menu_items IS
  'An individual dish or item within a menu section. Has dietary flags (V, VG, GF, DF, NF, halal), allergen info (14 UK allergens as text array), portion notes, and prep notes. Can have alternative items linked via menu_item_alternatives.';

COMMENT ON COLUMN public.menu_items.id IS 'Primary key (UUID).';
COMMENT ON COLUMN public.menu_items.organisation_id IS 'The organisation this item belongs to. Used for RLS.';
COMMENT ON COLUMN public.menu_items.menu_section_id IS 'The section this item belongs to. Cascading delete — removing the section removes all items.';
COMMENT ON COLUMN public.menu_items.name IS 'Name of the dish, e.g. "Burrata with Heritage Tomatoes", "Chocolate Fondant".';
COMMENT ON COLUMN public.menu_items.description IS 'Description of the dish, e.g. "with basil oil and aged balsamic". Displayed on menus and kitchen sheets.';
COMMENT ON COLUMN public.menu_items.dietary_flags IS 'Array of dietary flag codes: V (vegetarian), VG (vegan), GF (gluten-free), DF (dairy-free), NF (nut-free), halal. Validated in application layer.';
COMMENT ON COLUMN public.menu_items.allergens IS 'Array of UK allergen codes from the fixed set of 14: celery, cereals_containing_gluten, crustaceans, eggs, fish, lupin, milk, molluscs, mustard, nuts, peanuts, sesame, soya, sulphites. Validated in application layer.';
COMMENT ON COLUMN public.menu_items.portion_notes IS 'Portion size or quantity notes, e.g. "2 pieces per person", "500g total", "1 per 2 guests".';
COMMENT ON COLUMN public.menu_items.prep_notes IS 'Preparation notes for the kitchen team, e.g. "Prep day before, assemble on-site".';
COMMENT ON COLUMN public.menu_items.sort_order IS 'Display order within the section. 0-indexed.';
COMMENT ON COLUMN public.menu_items.created_at IS 'Timestamp when this item was created.';
COMMENT ON COLUMN public.menu_items.updated_at IS 'Timestamp of the last update. Auto-set by trigger.';

COMMENT ON TABLE public.menu_item_alternatives IS
  'Junction table linking a menu item to its alternatives (e.g. a vegan alternative to a meat dish). Both items must be in the same menu. The alternative_item_id is the substitute option.';

COMMENT ON COLUMN public.menu_item_alternatives.id IS 'Primary key (UUID).';
COMMENT ON COLUMN public.menu_item_alternatives.organisation_id IS 'The organisation this link belongs to. Used for RLS.';
COMMENT ON COLUMN public.menu_item_alternatives.menu_item_id IS 'The original menu item. Cascading delete — removing the item removes all its alternative links.';
COMMENT ON COLUMN public.menu_item_alternatives.alternative_item_id IS 'The alternative item. Cascading delete — removing the alternative removes the link.';
COMMENT ON COLUMN public.menu_item_alternatives.created_at IS 'Timestamp when this alternative link was created.';
