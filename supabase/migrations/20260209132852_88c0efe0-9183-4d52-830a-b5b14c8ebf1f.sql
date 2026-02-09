
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Monthly closures
CREATE TABLE public.monthly_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  total_income NUMERIC NOT NULL DEFAULT 0,
  total_expenses NUMERIC NOT NULL DEFAULT 0,
  total_investment NUMERIC NOT NULL DEFAULT 0,
  spent_percentage NUMERIC NOT NULL DEFAULT 0,
  invested_percentage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year)
);

ALTER TABLE public.monthly_closures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own closures"
  ON public.monthly_closures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own closures"
  ON public.monthly_closures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own closures"
  ON public.monthly_closures FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own closures"
  ON public.monthly_closures FOR DELETE
  USING (auth.uid() = user_id);

-- Closure incomes
CREATE TABLE public.closure_incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closure_id UUID NOT NULL REFERENCES public.monthly_closures(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL
);

ALTER TABLE public.closure_incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage closure incomes"
  ON public.closure_incomes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.monthly_closures
      WHERE id = closure_incomes.closure_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.monthly_closures
      WHERE id = closure_incomes.closure_id AND user_id = auth.uid()
    )
  );

-- Closure expenses
CREATE TABLE public.closure_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closure_id UUID NOT NULL REFERENCES public.monthly_closures(id) ON DELETE CASCADE,
  date TEXT,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other'
);

ALTER TABLE public.closure_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage closure expenses"
  ON public.closure_expenses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.monthly_closures
      WHERE id = closure_expenses.closure_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.monthly_closures
      WHERE id = closure_expenses.closure_id AND user_id = auth.uid()
    )
  );

-- Categorization rules
CREATE TABLE public.categorization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categorization_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rules"
  ON public.categorization_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rules"
  ON public.categorization_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rules"
  ON public.categorization_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rules"
  ON public.categorization_rules FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_monthly_closures_updated_at
  BEFORE UPDATE ON public.monthly_closures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
