import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/Header';
import { HistoryCharts } from '@/components/HistoryCharts';
import { PeriodSummaryCards } from '@/components/PeriodSummaryCards';
import { useApp } from '@/contexts/AppContext';
import { useClosures, ClosureSummary } from '@/hooks/useClosures';
import { useCategoryStore } from '@/hooks/useCategoryStore';
import { formatCurrency } from '@/lib/currencyParser';

type PeriodFilter = 'all' | 'year' | 'semester' | 'quarter' | 'bimonth';

export default function History() {
  const navigate = useNavigate();
  const { language, t } = useApp();
  const { closures, loading } = useClosures();
  const categoryStore = useCategoryStore();
  const locale = language === 'pt' ? ptBR : enUS;

  const now = new Date();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('year');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const availableYears = useMemo(() => {
    const years = [...new Set(closures.map(c => c.year))].sort((a, b) => b - a);
    return years.length > 0 ? years : [now.getFullYear()];
  }, [closures, now]);

  const filteredClosures = useMemo(() => {
    const currentMonth = now.getMonth() + 1;

    return closures.filter(c => {
      switch (periodFilter) {
        case 'all':
          return true;
        case 'year':
          return c.year === selectedYear;
        case 'semester':
          return c.year === selectedYear && (currentMonth <= 6 ? c.month <= 6 : c.month > 6);
        case 'quarter': {
          const currentQuarter = Math.ceil(currentMonth / 3);
          const closureQuarter = Math.ceil(c.month / 3);
          return c.year === selectedYear && closureQuarter === currentQuarter;
        }
        case 'bimonth': {
          const currentBi = Math.ceil(currentMonth / 2);
          const closureBi = Math.ceil(c.month / 2);
          return c.year === selectedYear && closureBi === currentBi;
        }
        default:
          return true;
      }
    });
  }, [closures, periodFilter, selectedYear, now]);

  // Month-over-month comparison
  const monthComparison = useMemo(() => {
    const sorted = [...filteredClosures].sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.month - b.month
    );
    return sorted.map((c, i) => {
      const prev = i > 0 ? sorted[i - 1] : null;
      return {
        ...c,
        incomeDiff: prev ? c.totalIncome - prev.totalIncome : 0,
        expenseDiff: prev ? c.totalExpenses - prev.totalExpenses : 0,
        hasPrev: !!prev,
      };
    });
  }, [filteredClosures]);

  const periodOptions: { value: PeriodFilter; label: string }[] = [
    { value: 'all', label: t('history.allTime') },
    { value: 'year', label: t('history.annual') },
    { value: 'semester', label: t('history.semester') },
    { value: 'quarter', label: t('history.quarter') },
    { value: 'bimonth', label: t('history.bimonth') },
  ];

  const getMonthName = (month: number, year: number) => {
    return format(new Date(year, month - 1), 'MMMM yyyy', { locale });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        categories={categoryStore.categories}
        incomeTypes={categoryStore.incomeTypes}
        onAddCategory={categoryStore.addCategory}
        onRemoveCategory={categoryStore.removeCategory}
        onAddIncomeType={categoryStore.addIncomeType}
        onRemoveIncomeType={categoryStore.removeIncomeType}
        isDefaultCategory={categoryStore.isDefaultCategory}
        isDefaultIncomeType={categoryStore.isDefaultIncomeType}
      />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t('history.title')}</h2>
              <p className="text-muted-foreground">{t('history.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {periodFilter !== 'all' && (
              <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={periodFilter} onValueChange={v => setPeriodFilter(v as PeriodFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredClosures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('history.noData')}</h3>
            <p className="text-muted-foreground max-w-sm">{t('history.noDataDesc')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <PeriodSummaryCards closures={filteredClosures} />

            {/* Charts */}
            <HistoryCharts closures={filteredClosures} />

            {/* Month-over-Month Table */}
            {monthComparison.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-card px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-foreground">{t('history.monthComparison')}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('history.period')}</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('dashboard.totalIncome')}</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('history.incomeChange')}</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('dashboard.totalExpenses')}</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('history.expenseChange')}</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('dashboard.netInvestment')}</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('dashboard.invested')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthComparison.map(c => (
                        <tr
                          key={c.id}
                          className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
                          onClick={() => navigate(`/closure/${c.id}`)}
                        >
                          <td className="px-4 py-3 font-medium text-foreground capitalize">
                            {getMonthName(c.month, c.year)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-income">
                            {formatCurrency(c.totalIncome, language)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {c.hasPrev ? (
                              <span className={c.incomeDiff >= 0 ? 'text-income' : 'text-expense'}>
                                {c.incomeDiff >= 0 ? '+' : ''}{formatCurrency(c.incomeDiff, language)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-expense">
                            {formatCurrency(c.totalExpenses, language)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {c.hasPrev ? (
                              <span className={c.expenseDiff <= 0 ? 'text-income' : 'text-expense'}>
                                {c.expenseDiff >= 0 ? '+' : ''}{formatCurrency(c.expenseDiff, language)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-investment">
                            {formatCurrency(c.totalInvestment, language)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                            {c.investedPercentage.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
