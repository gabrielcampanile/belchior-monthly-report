import { useState, useCallback, useEffect } from 'react';
import { ExpenseCategory, IncomeType, EXPENSE_CATEGORIES, INCOME_TYPES } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DEFAULT_CATEGORIES: ExpenseCategory[] = [...EXPENSE_CATEGORIES];
const DEFAULT_INCOME_TYPES: IncomeType[] = [...INCOME_TYPES];

export function useCategoryStore() {
  const { user } = useAuth();
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customIncomeTypes, setCustomIncomeTypes] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load custom categories from DB
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('user_categories')
        .select('name, type')
        .eq('user_id', user.id);
      if (data) {
        setCustomCategories(data.filter(d => d.type === 'expense').map(d => d.name));
        setCustomIncomeTypes(data.filter(d => d.type === 'income').map(d => d.name));
      }
      setLoaded(true);
    })();
  }, [user]);

  const categories = [...DEFAULT_CATEGORIES, ...customCategories];
  const incomeTypes = [...DEFAULT_INCOME_TYPES, ...customIncomeTypes];

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed || categories.includes(trimmed)) return false;
    setCustomCategories(prev => [...prev, trimmed]);
    // Persist
    if (user) {
      supabase.from('user_categories').insert({ user_id: user.id, name: trimmed, type: 'expense' }).then();
    }
    return true;
  }, [categories, user]);

  const removeCategory = useCallback((name: string) => {
    if (DEFAULT_CATEGORIES.includes(name as ExpenseCategory)) return false;
    setCustomCategories(prev => prev.filter(c => c !== name));
    if (user) {
      supabase.from('user_categories').delete().eq('user_id', user.id).eq('name', name).eq('type', 'expense').then();
    }
    return true;
  }, [user]);

  const addIncomeType = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed || incomeTypes.includes(trimmed)) return false;
    setCustomIncomeTypes(prev => [...prev, trimmed]);
    if (user) {
      supabase.from('user_categories').insert({ user_id: user.id, name: trimmed, type: 'income' }).then();
    }
    return true;
  }, [incomeTypes, user]);

  const removeIncomeType = useCallback((name: string) => {
    if (DEFAULT_INCOME_TYPES.includes(name as IncomeType)) return false;
    setCustomIncomeTypes(prev => prev.filter(t => t !== name));
    if (user) {
      supabase.from('user_categories').delete().eq('user_id', user.id).eq('name', name).eq('type', 'income').then();
    }
    return true;
  }, [user]);

  const isDefaultCategory = useCallback((name: string) => {
    return DEFAULT_CATEGORIES.includes(name as ExpenseCategory);
  }, []);

  const isDefaultIncomeType = useCallback((name: string) => {
    return DEFAULT_INCOME_TYPES.includes(name as IncomeType);
  }, []);

  return {
    categories,
    incomeTypes,
    addCategory,
    removeCategory,
    addIncomeType,
    removeIncomeType,
    isDefaultCategory,
    isDefaultIncomeType,
  };
}
