import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExpenseEntry } from '@/types/finance';

export interface CategorizationRule {
  id: string;
  keyword: string;
  category: string;
}

export function useCategorizationRules() {
  const [rules, setRules] = useState<CategorizationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('categorization_rules')
        .select('id, keyword, category');
      if (data) setRules(data);
      setLoading(false);
    })();
  }, []);

  const addRule = useCallback(async (keyword: string, category: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return;
    // Avoid duplicates
    if (rules.some(r => r.keyword.toLowerCase() === trimmed)) return;
    const { data, error } = await supabase
      .from('categorization_rules')
      .insert({ keyword: trimmed, category, user_id: user.id })
      .select('id, keyword, category')
      .single();
    if (data && !error) setRules(prev => [...prev, data]);
  }, [rules]);

  const removeRule = useCallback(async (id: string) => {
    await supabase.from('categorization_rules').delete().eq('id', id);
    setRules(prev => prev.filter(r => r.id !== id));
  }, []);

  const autoCategorize = useCallback((expenses: Omit<ExpenseEntry, 'id'>[]): Omit<ExpenseEntry, 'id'>[] => {
    return expenses.map(expense => {
      const descLower = expense.description.toLowerCase();
      const match = rules.find(r => descLower.includes(r.keyword.toLowerCase()));
      if (match) {
        return { ...expense, category: match.category as any };
      }
      return expense;
    });
  }, [rules]);

  return { rules, loading, addRule, removeRule, autoCategorize };
}
