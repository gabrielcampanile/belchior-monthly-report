import { useMemo } from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/currencyParser';
import { ClosureSummary } from '@/hooks/useClosures';

interface PeriodSummaryCardsProps {
  closures: ClosureSummary[];
}

export function PeriodSummaryCards({ closures }: PeriodSummaryCardsProps) {
  const { language, t } = useApp();

  const totals = useMemo(() => {
    const totalIncome = closures.reduce((s, c) => s + c.totalIncome, 0);
    const totalExpenses = closures.reduce((s, c) => s + c.totalExpenses, 0);
    const totalInvestment = closures.reduce((s, c) => s + c.totalInvestment, 0);
    const avgInvestedPct = closures.length > 0
      ? closures.reduce((s, c) => s + c.investedPercentage, 0) / closures.length
      : 0;
    const avgIncome = closures.length > 0 ? totalIncome / closures.length : 0;
    const avgExpenses = closures.length > 0 ? totalExpenses / closures.length : 0;

    return { totalIncome, totalExpenses, totalInvestment, avgInvestedPct, avgIncome, avgExpenses };
  }, [closures]);

  const cards = [
    {
      label: t('history.totalIncome'),
      value: formatCurrency(totals.totalIncome, language),
      sub: `${t('history.avg')}: ${formatCurrency(totals.avgIncome, language)}`,
      icon: TrendingUp,
      color: 'income' as const,
    },
    {
      label: t('history.totalExpenses'),
      value: formatCurrency(totals.totalExpenses, language),
      sub: `${t('history.avg')}: ${formatCurrency(totals.avgExpenses, language)}`,
      icon: TrendingDown,
      color: 'expense' as const,
    },
    {
      label: t('history.totalInvestment'),
      value: formatCurrency(totals.totalInvestment, language),
      icon: PiggyBank,
      color: 'investment' as const,
    },
    {
      label: t('history.avgInvested'),
      value: `${totals.avgInvestedPct.toFixed(1)}%`,
      sub: `${closures.length} ${t('history.months')}`,
      icon: Percent,
      color: 'primary' as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => (
        <Card key={card.label} className="border-border/50 overflow-hidden">
          <div className={`h-1 bg-${card.color}`} />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className={`text-2xl font-bold font-mono text-${card.color}`}>{card.value}</p>
                {card.sub && <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>}
              </div>
              <div className={`w-12 h-12 rounded-full bg-${card.color}/10 flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 text-${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
