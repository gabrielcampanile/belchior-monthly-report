import { useState } from 'react';
import { Plus, Trash2, DollarSign, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IncomeEntry } from '@/types/finance';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/currencyParser';

interface IncomeFormProps {
  incomes: IncomeEntry[];
  incomeTypes: string[];
  onAddIncome: (income: Omit<IncomeEntry, 'id'>) => void;
  onRemoveIncome: (id: string) => void;
  onUpdateIncomeType: (id: string, type: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function IncomeForm({ incomes, incomeTypes, onAddIncome, onRemoveIncome, onUpdateIncomeType, onNext, onBack }: IncomeFormProps) {
  const { language, t } = useApp();
  const [source, setSource] = useState('');
  const [type, setType] = useState<string>(incomeTypes[0] || 'Salary');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !amount) return;
    onAddIncome({
      source: source.trim(),
      type: type as any,
      amount: parseFloat(amount),
      date: date || undefined,
    });
    setSource('');
    setAmount('');
    setDate('');
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

      {/* Add manual income */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-income text-base">
            <Plus className="w-4 h-4" />
            {t('income.newEntry')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <div className="space-y-1 flex-1 min-w-[120px]">
              <label className="text-xs text-muted-foreground">{t('categorize.date')}</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-secondary border-border text-sm h-9" />
            </div>
            <div className="space-y-1 flex-[2] min-w-[160px]">
              <label className="text-xs text-muted-foreground">{t('income.source')}</label>
              <Input placeholder={t('income.sourcePlaceholder')} value={source} onChange={e => setSource(e.target.value)} className="bg-secondary border-border text-sm h-9" />
            </div>
            <div className="space-y-1 min-w-[130px]">
              <label className="text-xs text-muted-foreground">{t('income.type')}</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-secondary border-border text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {incomeTypes.map(t => (
                    <SelectItem key={t} value={t}>{getTranslatedType(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 min-w-[120px]">
              <label className="text-xs text-muted-foreground">{t('income.amount')}</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{language === 'pt' ? 'R$' : '$'}</span>
                <Input type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="pl-7 bg-secondary border-border font-mono text-sm h-9" />
              </div>
            </div>
            <Button type="submit" variant="income" size="sm" className="h-9">
              <Plus className="w-4 h-4" />
              {t('income.addButton')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Income Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-income" />
            {t('income.entries')}
          </CardTitle>
          <CardDescription>
            {incomes.length === 0 ? t('income.noEntries') : `${incomes.length} ${incomes.length === 1 ? 'entry' : 'entries'}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incomes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t('income.addFirst')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('categorize.date')}</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('categorize.description')}</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('income.type')}</th>
                      <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('categorize.amount')}</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {incomes.map(income => (
                      <tr key={income.id} className="group hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-2 text-sm text-muted-foreground whitespace-nowrap">{income.date || '—'}</td>
                        <td className="py-3 px-2 text-sm text-foreground max-w-[200px] truncate">{income.source}</td>
                        <td className="py-3 px-2">
                          <Select value={income.type} onValueChange={v => onUpdateIncomeType(income.id, v)}>
                            <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              {incomeTypes.map(t => (
                                <SelectItem key={t} value={t}>{getTranslatedType(t)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-2 text-sm font-mono font-medium text-income text-right whitespace-nowrap">
                          {formatCurrency(income.amount, language)}
                        </td>
                        <td className="py-3 px-2">
                          <Button variant="ghost" size="icon" onClick={() => onRemoveIncome(income.id)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-muted-foreground">{t('income.total')}</span>
                <span className="text-xl font-bold font-mono text-income">{formatCurrency(totalIncome, language)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          {t('categorize.back')}
        </Button>
        <Button onClick={onNext} disabled={incomes.length === 0}>
          <ArrowRight className="w-4 h-4" />
          {t('income.continue')}
        </Button>
      </div>
    </div>
  );
}
