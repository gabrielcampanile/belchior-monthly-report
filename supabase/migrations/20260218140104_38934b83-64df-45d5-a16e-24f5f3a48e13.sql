
-- Add display_name for user overrides on default categories
ALTER TABLE public.user_categories ADD COLUMN IF NOT EXISTS display_name text;

-- Add sort_order for custom ordering
ALTER TABLE public.user_categories ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
