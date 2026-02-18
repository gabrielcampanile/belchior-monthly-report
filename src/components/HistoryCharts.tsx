import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/currencyParser';
import { ClosureSummary } from '@/hooks/useClosures';

interface HistoryChartsProps {
  closures: ClosureSummary[];
}

export function HistoryCharts({ closures }: HistoryChartsProps) {
  const { language, t } = useApp();
  const locale = language === 'pt' ? ptBR : enUS;

  const sortedClosures = useMemo(
    () => [...closures].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month),
    [closures]
  );

  const chartData = useMemo(() =>
    sortedClosures.map(c => ({
      label: format(new Date(c.year, c.month - 1), 'MMM yy', { locale }),
      income: c.totalIncome,
      expenses: c.totalExpenses,
      investment: c.totalInvestment,
      investedPct: c.investedPercentage,
    })),
    [sortedClosures, locale]
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium text-foreground mb-1 capitalize">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
            {p.name}: {p.dataKey === 'investedPct' ? `${p.value.toFixed(1)}%` : formatCurrency(p.value, language)}
          </p>
        ))}
      </div>
    );
  };

  if (chartData.length < 2) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
          {t('history.needMore')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Income vs Expenses Evolution */}
      <Card className="border-border/50 lg:col-span-2">
        <CardHeader>
          <CardTitle>{t('history.evolution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => formatCurrency(v, language)} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-foreground text-sm">{value}</span>} />
                <Line
                  type="monotone"
                  dataKey="income"
                  name={t('dashboard.totalIncome')}
                  stroke="hsl(var(--income))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--income))', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name={t('dashboard.totalExpenses')}
                  stroke="hsl(var(--expense))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--expense))', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="investment"
                  name={t('dashboard.netInvestment')}
                  stroke="hsl(var(--investment))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--investment))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Comparison Bar Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>{t('history.comparison')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => formatCurrency(v, language)} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-foreground text-sm">{value}</span>} />
                <Bar dataKey="income" name={t('dashboard.totalIncome')} fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name={t('dashboard.totalExpenses')} fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Investment Value Evolution */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>{t('history.investmentValueEvolution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => formatCurrency(v, language)} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="investment" name={t('dashboard.netInvestment')} fill="hsl(var(--investment))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Investment % Evolution */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>{t('history.investmentEvolution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="investedPct"
                  name={t('dashboard.invested')}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
