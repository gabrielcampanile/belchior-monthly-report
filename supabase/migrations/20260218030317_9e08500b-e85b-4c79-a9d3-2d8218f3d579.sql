
-- Add date column to closure_incomes
ALTER TABLE closure_incomes ADD COLUMN IF NOT EXISTS date text;

-- Custom user categories table
CREATE TABLE user_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('expense', 'income')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name, type)
);

ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories" ON user_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON user_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON user_categories FOR DELETE USING (auth.uid() = user_id);
