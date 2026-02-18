import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/Header';
import { useCategoryStore } from '@/hooks/useCategoryStore';
import { useInvestments } from '@/hooks/useInvestments';
import { InvestmentChart } from '@/components/InvestmentChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Wallet, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Investments() {
  const { language, t } = useApp();
  const categoryStore = useCategoryStore();
  const { calculatedData, loading, saveSnapshot, deleteSnapshot, getContributionForMonth } = useInvestments();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [balance, setBalance] = useState('');
  const [contribution, setContribution] = useState('');
  const [saving, setSaving] = useState(false);

  const months = language === 'pt' ? MONTHS_PT : MONTHS_EN;

  // Auto-fill contribution from closure
  useEffect(() => {
    getContributionForMonth(month, year).then(val => {
      if (val !== null) setContribution(String(val));
    });
  }, [month, year, getContributionForMonth]);

  const formatCurrency = (value: number) => {
    return language === 'pt'
      ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const handleSave = async () => {
    const balanceNum = parseFloat(balance);
    const contribNum = parseFloat(contribution) || 0;
    if (isNaN(balanceNum)) return;

    setSaving(true);
    try {
      await saveSnapshot(month, year, balanceNum, contribNum);
      setBalance('');
      setContribution('');
      toast({ title: t('investments.saved'), description: t('investments.savedDesc') });
    } catch (err: any) {
      toast({ title: t('auth.error'), description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteSnapshot(id);
    toast({ title: t('investments.deleted') });
  };

  const latestBalance = calculatedData.length > 0 ? calculatedData[calculatedData.length - 1] : null;
  const reversedData = [...calculatedData].reverse();

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
      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('investments.title')}</h2>
          <p className="text-muted-foreground">{t('investments.subtitle')}</p>
        </div>

        {/* Current balance card */}
        {latestBalance && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('investments.currentBalance')}</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(latestBalance.balance)}</p>
                <p className="text-sm text-muted-foreground">
                  {months[latestBalance.month - 1]} {latestBalance.year}
                  {latestBalance.yieldPercentage !== 0 && (
                    <span className={latestBalance.yield >= 0 ? 'text-green-600 ml-2' : 'text-destructive ml-2'}>
                      {latestBalance.yield >= 0 ? '+' : ''}{latestBalance.yieldPercentage.toFixed(2)}%
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t('investments.addSnapshot')}
            </CardTitle>
            <CardDescription>{t('investments.addSnapshotDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{t('home.month')}</Label>
                <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('home.year')}</Label>
                <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025, 2026, 2027].map(y => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('investments.balance')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('investments.contribution')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={contribution}
                  onChange={e => setContribution(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving || !balance} className="mt-4">
              {t('common.save')}
            </Button>
          </CardContent>
        </Card>

        {/* Chart */}
        {calculatedData.length >= 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('investments.evolution')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InvestmentChart data={calculatedData} />
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('investments.history')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">{t('investments.loading')}</p>
            ) : reversedData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t('investments.empty')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('history.period')}</TableHead>
                    <TableHead className="text-right">{t('investments.balance')}</TableHead>
                    <TableHead className="text-right">{t('investments.contribution')}</TableHead>
                    <TableHead className="text-right">{t('investments.yield')}</TableHead>
                    <TableHead className="text-right">{t('investments.profitability')}</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reversedData.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{months[row.month - 1]} {row.year}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(row.balance)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.contribution)}</TableCell>
                      <TableCell className={`text-right ${row.yield >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {row.yield !== 0 ? formatCurrency(row.yield) : '—'}
                      </TableCell>
                      <TableCell className={`text-right ${row.yieldPercentage >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {row.yieldPercentage !== 0 ? `${row.yieldPercentage.toFixed(2)}%` : '—'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
