import { useApp } from '@/contexts/AppContext';
import { CalculatedSnapshot } from '@/hooks/useInvestments';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface InvestmentChartProps {
  data: CalculatedSnapshot[];
}

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function InvestmentChart({ data }: InvestmentChartProps) {
  const { language, t } = useApp();
  const months = language === 'pt' ? MONTHS_PT : MONTHS_EN;

  const chartData = data.map(d => ({
    name: `${months[d.month - 1]}/${d.year}`,
    [t('investments.balance')]: d.balance,
    [t('investments.contribution')]: d.contribution,
    [t('investments.yield')]: d.yield,
  }));

  if (data.length < 2) return null;

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="name" className="text-xs fill-muted-foreground" />
          <YAxis className="text-xs fill-muted-foreground" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))',
            }}
          />
          <Legend />
          <Bar dataKey={t('investments.contribution')} stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
          <Bar dataKey={t('investments.yield')} stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey={t('investments.balance')} stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
