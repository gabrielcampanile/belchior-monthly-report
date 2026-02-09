import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { IncomeEntry, ExpenseEntry, FinancialSummary, EXPENSE_CATEGORIES, ExpenseCategory } from '@/types/finance';

export interface ClosureSummary {
  id: string;
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  totalInvestment: number;
  spentPercentage: number;
  investedPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export function useClosures() {
  const { user } = useAuth();
  const [closures, setClosures] = useState<ClosureSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClosures = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('monthly_closures')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (!error && data) {
      setClosures(data.map(c => ({
        id: c.id,
        month: c.month,
        year: c.year,
        totalIncome: Number(c.total_income),
        totalExpenses: Number(c.total_expenses),
        totalInvestment: Number(c.total_investment),
        spentPercentage: Number(c.spent_percentage),
        investedPercentage: Number(c.invested_percentage),
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchClosures();
  }, [fetchClosures]);

  const saveClosure = useCallback(async (
    month: number,
    year: number,
    incomes: IncomeEntry[],
    expenses: ExpenseEntry[],
    summary: FinancialSummary
  ) => {
    if (!user) throw new Error('Not authenticated');

    // Check if closure exists
    const { data: existing } = await supabase
      .from('monthly_closures')
      .select('id')
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    let closureId: string;

    if (existing) {
      closureId = existing.id;
      // Update closure
      await supabase
        .from('monthly_closures')
        .update({
          total_income: summary.totalIncome,
          total_expenses: summary.totalExpenses,
          total_investment: summary.totalInvestment,
          spent_percentage: summary.spentPercentage,
          invested_percentage: summary.investedPercentage,
        })
        .eq('id', closureId);

      // Delete old items
      await supabase.from('closure_incomes').delete().eq('closure_id', closureId);
      await supabase.from('closure_expenses').delete().eq('closure_id', closureId);
    } else {
      const { data: newClosure, error } = await supabase
        .from('monthly_closures')
        .insert({
          user_id: user.id,
          month,
          year,
          total_income: summary.totalIncome,
          total_expenses: summary.totalExpenses,
          total_investment: summary.totalInvestment,
          spent_percentage: summary.spentPercentage,
          invested_percentage: summary.investedPercentage,
        })
        .select('id')
        .single();

      if (error || !newClosure) throw error || new Error('Failed to create closure');
      closureId = newClosure.id;
    }

    // Insert incomes
    if (incomes.length > 0) {
      const { error: incErr } = await supabase.from('closure_incomes').insert(
        incomes.map(i => ({
          closure_id: closureId,
          source: i.source,
          type: i.type,
          amount: i.amount,
        }))
      );
      if (incErr) throw incErr;
    }

    // Insert expenses
    if (expenses.length > 0) {
      const { error: expErr } = await supabase.from('closure_expenses').insert(
        expenses.map(e => ({
          closure_id: closureId,
          date: e.date,
          description: e.description,
          amount: e.amount,
          category: e.category,
        }))
      );
      if (expErr) throw expErr;
    }

    await fetchClosures();
    return closureId;
  }, [user, fetchClosures]);

  const loadClosure = useCallback(async (closureId: string) => {
    const [{ data: incData }, { data: expData }] = await Promise.all([
      supabase.from('closure_incomes').select('*').eq('closure_id', closureId),
      supabase.from('closure_expenses').select('*').eq('closure_id', closureId),
    ]);

    const incomes: IncomeEntry[] = (incData || []).map(i => ({
      id: i.id,
      source: i.source,
      type: i.type as IncomeEntry['type'],
      amount: Number(i.amount),
    }));

    const expenses: ExpenseEntry[] = (expData || []).map(e => ({
      id: e.id,
      date: e.date || '',
      description: e.description,
      amount: Number(e.amount),
      category: e.category as ExpenseCategory,
    }));

    return { incomes, expenses };
  }, []);

  const deleteClosure = useCallback(async (closureId: string) => {
    await supabase.from('closure_expenses').delete().eq('closure_id', closureId);
    await supabase.from('closure_incomes').delete().eq('closure_id', closureId);
    await supabase.from('monthly_closures').delete().eq('id', closureId);
    await fetchClosures();
  }, [fetchClosures]);

  return { closures, loading, saveClosure, loadClosure, deleteClosure, refetch: fetchClosures };
}
