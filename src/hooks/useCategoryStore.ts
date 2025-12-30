import { useState, useCallback } from 'react';
import { ExpenseCategory, IncomeType, EXPENSE_CATEGORIES, INCOME_TYPES } from '@/types/finance';

const DEFAULT_CATEGORIES: ExpenseCategory[] = [...EXPENSE_CATEGORIES];
const DEFAULT_INCOME_TYPES: IncomeType[] = [...INCOME_TYPES];

export function useCategoryStore() {
  const [categories, setCategories] = useState<string[]>([...DEFAULT_CATEGORIES]);
  const [incomeTypes, setIncomeTypes] = useState<string[]>([...DEFAULT_INCOME_TYPES]);

  const addCategory = useCallback((name: string) => {
    if (name.trim() && !categories.includes(name.trim())) {
      setCategories(prev => [...prev, name.trim()]);
      return true;
    }
    return false;
  }, [categories]);

  const removeCategory = useCallback((name: string) => {
    // Don't allow removing default categories
    if (DEFAULT_CATEGORIES.includes(name as ExpenseCategory)) {
      return false;
    }
    setCategories(prev => prev.filter(c => c !== name));
    return true;
  }, []);

  const addIncomeType = useCallback((name: string) => {
    if (name.trim() && !incomeTypes.includes(name.trim())) {
      setIncomeTypes(prev => [...prev, name.trim()]);
      return true;
    }
    return false;
  }, [incomeTypes]);

  const removeIncomeType = useCallback((name: string) => {
    // Don't allow removing default income types
    if (DEFAULT_INCOME_TYPES.includes(name as IncomeType)) {
      return false;
    }
    setIncomeTypes(prev => prev.filter(t => t !== name));
    return true;
  }, []);

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
