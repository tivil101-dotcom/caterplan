-- CaterPlan: Add updated_at column and trigger to menu_item_alternatives
-- Run this in the Supabase SQL Editor

ALTER TABLE public.menu_item_alternatives
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

CREATE TRIGGER menu_item_alternatives_set_updated_at
  BEFORE UPDATE ON public.menu_item_alternatives
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON COLUMN public.menu_item_alternatives.updated_at IS
  'Timestamp of the last update. Auto-set by trigger.';
