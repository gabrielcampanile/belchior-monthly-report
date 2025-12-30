import { useState } from 'react';
import { Plus, Trash2, DollarSign, Briefcase, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IncomeEntry } from '@/types/finance';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/currencyParser';

interface IncomeFormProps {
  incomes: IncomeEntry[];
  incomeTypes: string[];
  onAddIncome: (income: Omit<IncomeEntry, 'id'>) => void;
  onRemoveIncome: (id: string) => void;
  onNext: () => void;
}

export function IncomeForm({ incomes, incomeTypes, onAddIncome, onRemoveIncome, onNext }: IncomeFormProps) {
  const { language, t } = useApp();
  const [source, setSource] = useState('');
  const [type, setType] = useState<string>(incomeTypes[0] || 'Salary');
  const [amount, setAmount] = useState('');

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !amount) return;

    onAddIncome({
      source: source.trim(),
      type: type as any,
      amount: parseFloat(amount),
    });

    setSource('');
    setAmount('');
  };

  const getTranslatedType = (incomeType: string) => {
    const key = `incomeType.${incomeType}`;
    const translated = t(key);
    return translated !== key ? translated : incomeType;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('income.title')}</h2>
        <p className="text-muted-foreground">{t('income.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income Form */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-income">
              <Plus className="w-5 h-5" />
              {t('income.newEntry')}
            </CardTitle>
            <CardDescription>{t('income.addNew')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source">{t('income.source')}</Label>
                <Input
                  id="source"
                  placeholder={t('income.sourcePlaceholder')}
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">{t('income.type')}</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {incomeTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {getTranslatedType(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t('income.amount')}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {language === 'pt' ? 'R$' : '$'}
                  </span>
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
                {t('income.addButton')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Income List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
              {t('income.entries')}
            </CardTitle>
            <CardDescription>
              {incomes.length === 0 
                ? t('income.noEntries')
                : `${incomes.length} ${incomes.length === 1 ? 'entry' : 'entries'}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {incomes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('income.addFirst')}</p>
                </div>
              ) : (
                incomes.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50 group hover:border-income/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{income.source}</p>
                      <p className="text-xs text-muted-foreground">{getTranslatedType(income.type)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-income">
                        {formatCurrency(income.amount, language)}
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
                  <span className="text-muted-foreground">{t('income.total')}</span>
                  <span className="text-xl font-bold font-mono text-income">
                    {formatCurrency(totalIncome, language)}
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
          {t('income.continue')}
        </Button>
      </div>
    </div>
  );
}
