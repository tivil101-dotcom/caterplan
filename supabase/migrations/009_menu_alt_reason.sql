-- CaterPlan: Add reason column to menu_item_alternatives
-- Run this in the Supabase SQL Editor

ALTER TABLE public.menu_item_alternatives
  ADD COLUMN reason TEXT;

ALTER TABLE public.menu_item_alternatives
  ADD CONSTRAINT menu_item_alternatives_valid_reason CHECK (
    reason IS NULL OR reason IN (
      'vegetarian', 'vegan', 'gluten_free', 'dairy_free',
      'nut_free', 'halal', 'allergy', 'other'
    )
  );

COMMENT ON COLUMN public.menu_item_alternatives.reason IS
  'Why this alternative exists. One of: vegetarian, vegan, gluten_free, dairy_free, nut_free, halal, allergy, other. NULL if no specific reason.';
