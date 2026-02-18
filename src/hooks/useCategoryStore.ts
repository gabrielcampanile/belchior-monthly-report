import { useState, useCallback, useEffect, useMemo } from 'react';
import { ExpenseCategory, IncomeType, EXPENSE_CATEGORIES, INCOME_TYPES, CATEGORY_COLORS } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DEFAULT_CATEGORIES: ExpenseCategory[] = [...EXPENSE_CATEGORIES];
const DEFAULT_INCOME_TYPES: IncomeType[] = [...INCOME_TYPES];

const DEFAULT_INCOME_COLORS: Record<string, string> = {
  'Salary': '#22c55e',
  'Freelance': '#3b82f6',
  'Other': '#6b7280',
};

interface CategoryOverride {
  name: string;
  type: string;
  color?: string | null;
  display_name?: string | null;
  sort_order?: number;
}

export function useCategoryStore() {
  const { user } = useAuth();
  const [overrides, setOverrides] = useState<CategoryOverride[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customIncomeTypes, setCustomIncomeTypes] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('user_categories')
        .select('name, type, color, display_name, sort_order')
        .eq('user_id', user.id);
      if (data) {
        setOverrides(data as CategoryOverride[]);
        setCustomCategories(
          data.filter(d => d.type === 'expense' && !DEFAULT_CATEGORIES.includes(d.name as ExpenseCategory)).map(d => d.name)
        );
        setCustomIncomeTypes(
          data.filter(d => d.type === 'income' && !DEFAULT_INCOME_TYPES.includes(d.name as IncomeType)).map(d => d.name)
        );
      }
      setLoaded(true);
    })();
  }, [user]);

  // Build sorted categories
  const categories = useMemo(() => {
    const all = [...DEFAULT_CATEGORIES, ...customCategories];
    const getOrder = (name: string) => {
      const ov = overrides.find(o => o.name === name && o.type === 'expense');
      return ov?.sort_order ?? all.indexOf(name);
    };
    return [...all].sort((a, b) => getOrder(a) - getOrder(b));
  }, [customCategories, overrides]);

  const incomeTypes = useMemo(() => {
    const all = [...DEFAULT_INCOME_TYPES, ...customIncomeTypes];
    const getOrder = (name: string) => {
      const ov = overrides.find(o => o.name === name && o.type === 'income');
      return ov?.sort_order ?? all.indexOf(name);
    };
    return [...all].sort((a, b) => getOrder(a) - getOrder(b));
  }, [customIncomeTypes, overrides]);

  const getCategoryColor = useCallback((name: string): string => {
    const ov = overrides.find(o => o.name === name && o.type === 'expense');
    return ov?.color || CATEGORY_COLORS[name as ExpenseCategory] || '#6b7280';
  }, [overrides]);

  const getIncomeTypeColor = useCallback((name: string): string => {
    const ov = overrides.find(o => o.name === name && o.type === 'income');
    return ov?.color || DEFAULT_INCOME_COLORS[name] || '#6b7280';
  }, [overrides]);

  const getCategoryDisplayName = useCallback((name: string): string => {
    const ov = overrides.find(o => o.name === name && o.type === 'expense');
    return ov?.display_name || name;
  }, [overrides]);

  const getIncomeTypeDisplayName = useCallback((name: string): string => {
    const ov = overrides.find(o => o.name === name && o.type === 'income');
    return ov?.display_name || name;
  }, [overrides]);

  const upsertOverride = useCallback(async (name: string, type: string, updates: Partial<CategoryOverride>) => {
    if (!user) return;
    const existing = overrides.find(o => o.name === name && o.type === type);
    const newOverride = { ...existing, name, type, ...updates };
    setOverrides(prev => {
      const filtered = prev.filter(o => !(o.name === name && o.type === type));
      return [...filtered, newOverride];
    });
    await supabase.from('user_categories').upsert(
      { user_id: user.id, name, type, ...updates } as any,
      { onConflict: 'user_id,name,type' }
    );
  }, [user, overrides]);

  const updateCategoryColor = useCallback((name: string, color: string) => {
    upsertOverride(name, 'expense', { color });
  }, [upsertOverride]);

  const updateIncomeTypeColor = useCallback((name: string, color: string) => {
    upsertOverride(name, 'income', { color });
  }, [upsertOverride]);

  const editCategory = useCallback((name: string, displayName: string) => {
    upsertOverride(name, 'expense', { display_name: displayName });
  }, [upsertOverride]);

  const editIncomeType = useCallback((name: string, displayName: string) => {
    upsertOverride(name, 'income', { display_name: displayName });
  }, [upsertOverride]);

  const reorderCategories = useCallback((orderedNames: string[]) => {
    orderedNames.forEach((name, idx) => {
      upsertOverride(name, 'expense', { sort_order: idx });
    });
  }, [upsertOverride]);

  const reorderIncomeTypes = useCallback((orderedNames: string[]) => {
    orderedNames.forEach((name, idx) => {
      upsertOverride(name, 'income', { sort_order: idx });
    });
  }, [upsertOverride]);

  const addCategory = useCallback((name: string, color?: string) => {
    const trimmed = name.trim();
    if (!trimmed || [...DEFAULT_CATEGORIES, ...customCategories].includes(trimmed as any)) return false;
    setCustomCategories(prev => [...prev, trimmed]);
    const sortOrder = DEFAULT_CATEGORIES.length + customCategories.length;
    if (user) {
      supabase.from('user_categories').insert({
        user_id: user.id, name: trimmed, type: 'expense',
        color: color || null, sort_order: sortOrder,
      } as any).then();
    }
    setOverrides(prev => [...prev, { name: trimmed, type: 'expense', color, sort_order: sortOrder }]);
    return true;
  }, [customCategories, user]);

  const removeCategory = useCallback((name: string) => {
    if (DEFAULT_CATEGORIES.includes(name as ExpenseCategory)) return false;
    setCustomCategories(prev => prev.filter(c => c !== name));
    setOverrides(prev => prev.filter(o => !(o.name === name && o.type === 'expense')));
    if (user) {
      supabase.from('user_categories').delete().eq('user_id', user.id).eq('name', name).eq('type', 'expense').then();
    }
    return true;
  }, [user]);

  const addIncomeType = useCallback((name: string, color?: string) => {
    const trimmed = name.trim();
    if (!trimmed || [...DEFAULT_INCOME_TYPES, ...customIncomeTypes].includes(trimmed as any)) return false;
    setCustomIncomeTypes(prev => [...prev, trimmed]);
    const sortOrder = DEFAULT_INCOME_TYPES.length + customIncomeTypes.length;
    if (user) {
      supabase.from('user_categories').insert({
        user_id: user.id, name: trimmed, type: 'income',
        color: color || null, sort_order: sortOrder,
      } as any).then();
    }
    setOverrides(prev => [...prev, { name: trimmed, type: 'income', color, sort_order: sortOrder }]);
    return true;
  }, [customIncomeTypes, user]);

  const removeIncomeType = useCallback((name: string) => {
    if (DEFAULT_INCOME_TYPES.includes(name as IncomeType)) return false;
    setCustomIncomeTypes(prev => prev.filter(t => t !== name));
    setOverrides(prev => prev.filter(o => !(o.name === name && o.type === 'income')));
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
    getCategoryColor,
    getIncomeTypeColor,
    getCategoryDisplayName,
    getIncomeTypeDisplayName,
    updateCategoryColor,
    updateIncomeTypeColor,
    editCategory,
    editIncomeType,
    reorderCategories,
    reorderIncomeTypes,
  };
}
