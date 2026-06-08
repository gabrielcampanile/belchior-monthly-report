import { useState, useCallback, useMemo } from 'react';
import { 
  IncomeEntry, 
  ExpenseEntry, 
  FinancialSummary, 
  ExpenseCategory 
} from '@/types/finance';

export function useFinanceStore() {
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);

  const addIncome = useCallback((income: Omit<IncomeEntry, 'id'>) => {
    const newIncome: IncomeEntry = {
      ...income,
      id: crypto.randomUUID(),
    };
    setIncomes(prev => [...prev, newIncome]);
  }, []);

  const removeIncome = useCallback((id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
  }, []);

  const addExpenses = useCallback((newExpenses: Omit<ExpenseEntry, 'id'>[]) => {
    const expensesWithIds = newExpenses.map(expense => ({
      ...expense,
      id: crypto.randomUUID(),
    }));
    setExpenses(prev => [...prev, ...expensesWithIds]);
  }, []);

  const updateExpenseCategory = useCallback((id: string, category: ExpenseCategory) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === id ? { ...expense, category } : expense
      )
    );
  }, []);

  const updateIncomeType = useCallback((id: string, type: string) => {
    setIncomes(prev =>
      prev.map(income =>
        income.id === id ? { ...income, type: type as any } : income
      )
    );
  }, []);

  const removeExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearAllExpenses = useCallback(() => {
    setExpenses([]);
  }, []);

  const reorderExpenses = useCallback((fromIndex: number, toIndex: number) => {
    setExpenses(prev => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  const reorderIncomes = useCallback((fromIndex: number, toIndex: number) => {
    setIncomes(prev => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  const summary: FinancialSummary = useMemo(() => {
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInvestment = totalIncome - totalExpenses;

    const spentPercentage = totalIncome > 0
      ? (totalExpenses / totalIncome) * 100
      : 0;
    const investedPercentage = totalIncome > 0
      ? (totalInvestment / totalIncome) * 100
      : 0;

    const expensesByCategory: Record<string, number> = {};
    expenses.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    const incomesByType: Record<string, number> = {};
    incomes.forEach(i => {
      incomesByType[i.type] = (incomesByType[i.type] || 0) + i.amount;
    });

    return {
      totalIncome,
      totalExpenses,
      totalInvestment,
      spentPercentage,
      investedPercentage,
      expensesByCategory,
      incomesByType,
    };
  }, [incomes, expenses]);

  return {
    incomes,
    expenses,
    summary,
    addIncome,
    removeIncome,
    addExpenses,
    updateExpenseCategory,
    updateIncomeType,
    removeExpense,
    clearAllExpenses,
    reorderExpenses,
    reorderIncomes,
    setIncomes,
    setExpenses,
  };
}
