import { TrendingUp, TrendingDown, PiggyBank, Percent, FileDown, ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialSummary, EXPENSE_CATEGORIES, CATEGORY_COLORS, ExpenseCategory } from '@/types/finance';

interface DashboardProps {
  summary: FinancialSummary;
  onExportPDF: () => void;
  onBack: () => void;
}

export function Dashboard({ summary, onExportPDF, onBack }: DashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const chartData = EXPENSE_CATEGORIES
    .filter(cat => summary.expensesByCategory[cat] > 0)
    .map(cat => ({
      name: cat,
      value: summary.expensesByCategory[cat],
      color: CATEGORY_COLORS[cat],
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm font-mono" style={{ color: data.color }}>
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-muted-foreground">
            {((data.value / summary.totalExpenses) * 100).toFixed(1)}% of expenses
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Monthly Summary</h2>
        <p className="text-muted-foreground">Your financial overview for this month</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 overflow-hidden">
          <div className="h-1 bg-income" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold font-mono text-income">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-income/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-income" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 overflow-hidden">
          <div className="h-1 bg-expense" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold font-mono text-expense">
                  {formatCurrency(summary.totalExpenses)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-expense/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-expense" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 overflow-hidden">
          <div className="h-1 bg-investment" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Investment</p>
                <p className="text-2xl font-bold font-mono text-investment">
                  {formatCurrency(summary.totalInvestment)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-investment/10 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-investment" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 overflow-hidden">
          <div className="h-1 bg-primary" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Invested %</p>
                <p className="text-2xl font-bold font-mono text-primary">
                  {formatPercent(summary.investedPercentage)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Percent className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Visual breakdown of your spending</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No expense data to display
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>Amount spent per category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {EXPENSE_CATEGORIES
                .filter(cat => summary.expensesByCategory[cat] > 0)
                .sort((a, b) => summary.expensesByCategory[b] - summary.expensesByCategory[a])
                .map(cat => {
                  const amount = summary.expensesByCategory[cat];
                  const percentage = summary.totalExpenses > 0 
                    ? (amount / summary.totalExpenses) * 100 
                    : 0;
                  
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                          />
                          <span className="text-sm text-foreground">{cat}</span>
                        </div>
                        <span className="text-sm font-mono font-medium text-foreground">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: CATEGORY_COLORS[cat],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              
              {chartData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No categorized expenses yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spent vs Invested Bar */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Income Allocation</CardTitle>
          <CardDescription>How your income was distributed this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex h-8 rounded-lg overflow-hidden">
              <div 
                className="bg-expense flex items-center justify-center text-xs font-medium text-expense-foreground transition-all duration-500"
                style={{ width: `${Math.min(summary.spentPercentage, 100)}%` }}
              >
                {summary.spentPercentage > 10 && 'Spent'}
              </div>
              <div 
                className="bg-investment flex items-center justify-center text-xs font-medium text-investment-foreground transition-all duration-500"
                style={{ width: `${Math.min(summary.investedPercentage, 100)}%` }}
              >
                {summary.investedPercentage > 10 && 'Saved'}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-expense" />
                <span className="text-muted-foreground">Spent:</span>
                <span className="font-mono font-medium text-foreground">
                  {formatPercent(summary.spentPercentage)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-investment" />
                <span className="text-muted-foreground">Saved:</span>
                <span className="font-mono font-medium text-foreground">
                  {formatPercent(summary.investedPercentage)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back to Categorize
        </Button>
        <Button onClick={onExportPDF} variant="glow" size="lg">
          <FileDown className="w-4 h-4" />
          Export Monthly Report (PDF)
        </Button>
      </div>
    </div>
  );
}
