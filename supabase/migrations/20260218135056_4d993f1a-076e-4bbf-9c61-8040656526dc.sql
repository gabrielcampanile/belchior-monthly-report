
-- Add color column to user_categories for custom category colors
ALTER TABLE public.user_categories ADD COLUMN color text;

-- Add UPDATE policy (currently missing)
CREATE POLICY "Users can update own categories"
  ON public.user_categories
  FOR UPDATE
  USING (auth.uid() = user_id);
