import { useState } from 'react';
import { Plus, Trash2, DollarSign, Briefcase, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IncomeEntry, IncomeType, INCOME_TYPES } from '@/types/finance';

interface IncomeFormProps {
  incomes: IncomeEntry[];
  onAddIncome: (income: Omit<IncomeEntry, 'id'>) => void;
  onRemoveIncome: (id: string) => void;
  onNext: () => void;
}

export function IncomeForm({ incomes, onAddIncome, onRemoveIncome, onNext }: IncomeFormProps) {
  const [source, setSource] = useState('');
  const [type, setType] = useState<IncomeType>('Salary');
  const [amount, setAmount] = useState('');

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !amount) return;

    onAddIncome({
      source: source.trim(),
      type,
      amount: parseFloat(amount),
    });

    setSource('');
    setAmount('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Add Your Income</h2>
        <p className="text-muted-foreground">Enter all income sources for this month</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income Form */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-income">
              <Plus className="w-5 h-5" />
              New Income Entry
            </CardTitle>
            <CardDescription>Add a new income source</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source">Income Source</Label>
                <Input
                  id="source"
                  placeholder="e.g., Company Name, Client Project..."
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Income Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as IncomeType)}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {INCOME_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-9 bg-secondary border-border font-mono"
                  />
                </div>
              </div>

              <Button type="submit" variant="income" className="w-full">
                <Plus className="w-4 h-4" />
                Add Income
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Income List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
              Income Entries
            </CardTitle>
            <CardDescription>
              {incomes.length === 0 
                ? 'No income entries yet' 
                : `${incomes.length} ${incomes.length === 1 ? 'entry' : 'entries'}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {incomes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Add your first income entry</p>
                </div>
              ) : (
                incomes.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50 group hover:border-income/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{income.source}</p>
                      <p className="text-xs text-muted-foreground">{income.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-income">
                        {formatCurrency(income.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveIncome(income.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {incomes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Income</span>
                  <span className="text-xl font-bold font-mono text-income">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} size="lg" disabled={incomes.length === 0}>
          <TrendingUp className="w-4 h-4" />
          Continue to Expenses
        </Button>
      </div>
    </div>
  );
}
