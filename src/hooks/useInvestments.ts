import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface InvestmentSnapshot {
  id: string;
  month: number;
  year: number;
  balance: number;
  contribution: number;
  createdAt: string;
  updatedAt: string;
}

export interface CalculatedSnapshot extends InvestmentSnapshot {
  yield: number;
  yieldPercentage: number;
}

export function useInvestments() {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState<InvestmentSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSnapshots = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('investment_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: true })
      .order('month', { ascending: true });

    if (!error && data) {
      setSnapshots(data.map((s: any) => ({
        id: s.id,
        month: s.month,
        year: s.year,
        balance: Number(s.balance),
        contribution: Number(s.contribution),
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  const saveSnapshot = useCallback(async (
    month: number,
    year: number,
    balance: number,
    contribution: number
  ) => {
    if (!user) throw new Error('Not authenticated');

    const { data: existing } = await (supabase as any)
      .from('investment_snapshots')
      .select('id')
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (existing) {
      await (supabase as any)
        .from('investment_snapshots')
        .update({ balance, contribution })
        .eq('id', existing.id);
    } else {
      const { error } = await (supabase as any)
        .from('investment_snapshots')
        .insert({ user_id: user.id, month, year, balance, contribution });
      if (error) throw error;
    }

    await fetchSnapshots();
  }, [user, fetchSnapshots]);

  const deleteSnapshot = useCallback(async (id: string) => {
    await (supabase as any)
      .from('investment_snapshots')
      .delete()
      .eq('id', id);
    await fetchSnapshots();
  }, [fetchSnapshots]);

  const getContributionForMonth = useCallback(async (month: number, year: number): Promise<number | null> => {
    if (!user) return null;
    const { data } = await supabase
      .from('monthly_closures')
      .select('total_investment')
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();
    return data ? Number(data.total_investment) : null;
  }, [user]);

  const calculatedData: CalculatedSnapshot[] = useMemo(() => {
    return snapshots.map((snap, index) => {
      if (index === 0) {
        return { ...snap, yield: 0, yieldPercentage: 0 };
      }
      const prev = snapshots[index - 1];
      const yieldValue = snap.balance - (prev.balance + snap.contribution);
      const yieldPercentage = prev.balance !== 0
        ? (yieldValue / prev.balance) * 100
        : 0;
      return { ...snap, yield: yieldValue, yieldPercentage };
    });
  }, [snapshots]);

  return {
    snapshots,
    calculatedData,
    loading,
    saveSnapshot,
    deleteSnapshot,
    getContributionForMonth,
    refetch: fetchSnapshots,
  };
}
