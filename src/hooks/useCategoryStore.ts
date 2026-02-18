import { useState, useCallback, useEffect } from 'react';
import { ExpenseCategory, IncomeType, EXPENSE_CATEGORIES, INCOME_TYPES, CATEGORY_COLORS } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DEFAULT_CATEGORIES: ExpenseCategory[] = [...EXPENSE_CATEGORIES];
const DEFAULT_INCOME_TYPES: IncomeType[] = [...INCOME_TYPES];

// Default colors for income types
const DEFAULT_INCOME_COLORS: Record<string, string> = {
  'Salary': '#22c55e',
  'Freelance': '#3b82f6',
  'Other': '#6b7280',
};

export function useCategoryStore() {
  const { user } = useAuth();
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customIncomeTypes, setCustomIncomeTypes] = useState<string[]>([]);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
  const [incomeTypeColors, setIncomeTypeColors] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  // Load custom categories from DB
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('user_categories')
        .select('name, type, color')
        .eq('user_id', user.id);
      if (data) {
        const expenseCats = data.filter(d => d.type === 'expense');
        const incomeCats = data.filter(d => d.type === 'income');
        
        setCustomCategories(expenseCats.filter(d => !DEFAULT_CATEGORIES.includes(d.name as ExpenseCategory)).map(d => d.name));
        setCustomIncomeTypes(incomeCats.filter(d => !DEFAULT_INCOME_TYPES.includes(d.name as IncomeType)).map(d => d.name));
        
        // Load color overrides
        const expColors: Record<string, string> = {};
        const incColors: Record<string, string> = {};
        for (const d of expenseCats) {
          if (d.color) expColors[d.name] = d.color;
        }
        for (const d of incomeCats) {
          if (d.color) incColors[d.name] = d.color;
        }
        setCategoryColors(expColors);
        setIncomeTypeColors(incColors);
      }
      setLoaded(true);
    })();
  }, [user]);

  const categories = [...DEFAULT_CATEGORIES, ...customCategories];
  const incomeTypes = [...DEFAULT_INCOME_TYPES, ...customIncomeTypes];

  const getCategoryColor = useCallback((name: string): string => {
    return categoryColors[name] || CATEGORY_COLORS[name as ExpenseCategory] || '#6b7280';
  }, [categoryColors]);

  const getIncomeTypeColor = useCallback((name: string): string => {
    return incomeTypeColors[name] || DEFAULT_INCOME_COLORS[name] || '#6b7280';
  }, [incomeTypeColors]);

  const updateCategoryColor = useCallback((name: string, color: string) => {
    setCategoryColors(prev => ({ ...prev, [name]: color }));
    if (user) {
      // Upsert color override
      supabase.from('user_categories')
        .upsert({ user_id: user.id, name, type: 'expense', color }, { onConflict: 'user_id,name,type' })
        .then();
    }
  }, [user]);

  const updateIncomeTypeColor = useCallback((name: string, color: string) => {
    setIncomeTypeColors(prev => ({ ...prev, [name]: color }));
    if (user) {
      supabase.from('user_categories')
        .upsert({ user_id: user.id, name, type: 'income', color }, { onConflict: 'user_id,name,type' })
        .then();
    }
  }, [user]);

  const addCategory = useCallback((name: string, color?: string) => {
    const trimmed = name.trim();
    if (!trimmed || categories.includes(trimmed)) return false;
    setCustomCategories(prev => [...prev, trimmed]);
    if (color) setCategoryColors(prev => ({ ...prev, [trimmed]: color }));
    if (user) {
      supabase.from('user_categories').insert({ user_id: user.id, name: trimmed, type: 'expense', color: color || null }).then();
    }
    return true;
  }, [categories, user]);

  const removeCategory = useCallback((name: string) => {
    if (DEFAULT_CATEGORIES.includes(name as ExpenseCategory)) return false;
    setCustomCategories(prev => prev.filter(c => c !== name));
    setCategoryColors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (user) {
      supabase.from('user_categories').delete().eq('user_id', user.id).eq('name', name).eq('type', 'expense').then();
    }
    return true;
  }, [user]);

  const addIncomeType = useCallback((name: string, color?: string) => {
    const trimmed = name.trim();
    if (!trimmed || incomeTypes.includes(trimmed)) return false;
    setCustomIncomeTypes(prev => [...prev, trimmed]);
    if (color) setIncomeTypeColors(prev => ({ ...prev, [trimmed]: color }));
    if (user) {
      supabase.from('user_categories').insert({ user_id: user.id, name: trimmed, type: 'income', color: color || null }).then();
    }
    return true;
  }, [incomeTypes, user]);

  const removeIncomeType = useCallback((name: string) => {
    if (DEFAULT_INCOME_TYPES.includes(name as IncomeType)) return false;
    setCustomIncomeTypes(prev => prev.filter(t => t !== name));
    setIncomeTypeColors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (user) {
      supabase.from('user_categories').delete().eq('user_id', user.id).eq('name', name).eq('type', 'income').then();
    }
    return true;
  }, [user]);

  const editCategory = useCallback((oldName: string, newName: string) => {
    if (oldName === newName) return;
    // For now, editing renames in local state. Default categories keep their internal key.
    // This is a display-name override stored via color record.
    // Full rename would require updating all references - for simplicity, we just update the DB name for custom cats
    if (!DEFAULT_CATEGORIES.includes(oldName as ExpenseCategory)) {
      setCustomCategories(prev => prev.map(c => c === oldName ? newName : c));
      if (user) {
        supabase.from('user_categories').update({ name: newName }).eq('user_id', user.id).eq('name', oldName).eq('type', 'expense').then();
      }
    }
  }, [user]);

  const editIncomeType = useCallback((oldName: string, newName: string) => {
    if (oldName === newName) return;
    if (!DEFAULT_INCOME_TYPES.includes(oldName as IncomeType)) {
      setCustomIncomeTypes(prev => prev.map(t => t === oldName ? newName : t));
      if (user) {
        supabase.from('user_categories').update({ name: newName }).eq('user_id', user.id).eq('name', oldName).eq('type', 'income').then();
      }
    }
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
    updateCategoryColor,
    updateIncomeTypeColor,
    editCategory,
    editIncomeType,
  };
}
