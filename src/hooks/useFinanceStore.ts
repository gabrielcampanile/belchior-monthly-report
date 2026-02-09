import { useState, useCallback, useMemo } from 'react';
import { 
  IncomeEntry, 
  ExpenseEntry, 
  FinancialSummary, 
  EXPENSE_CATEGORIES,
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

  const removeExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearAllExpenses = useCallback(() => {
    setExpenses([]);
  }, []);

  const summary: FinancialSummary = useMemo(() => {
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInvestment = Math.max(0, totalIncome - totalExpenses);
    
    const spentPercentage = totalIncome > 0 
      ? (totalExpenses / totalIncome) * 100 
      : 0;
    const investedPercentage = totalIncome > 0 
      ? (totalInvestment / totalIncome) * 100 
      : 0;

    const expensesByCategory = EXPENSE_CATEGORIES.reduce((acc, category) => {
      acc[category] = expenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    return {
      totalIncome,
      totalExpenses,
      totalInvestment,
      spentPercentage,
      investedPercentage,
      expensesByCategory,
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
    removeExpense,
    clearAllExpenses,
    setIncomes,
    setExpenses,
  };
}
