CREATE TABLE public.investment_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  contribution numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year)
);

ALTER TABLE public.investment_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots"
  ON public.investment_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own snapshots"
  ON public.investment_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own snapshots"
  ON public.investment_snapshots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own snapshots"
  ON public.investment_snapshots FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_investment_snapshots_updated_at
  BEFORE UPDATE ON public.investment_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();