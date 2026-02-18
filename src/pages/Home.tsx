import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, TrendingUp, TrendingDown, PiggyBank, Trash2, Eye, Loader2, CheckCircle2, PenLine } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { useClosures } from '@/hooks/useClosures';
import { useCategoryStore } from '@/hooks/useCategoryStore';
import { formatCurrency } from '@/lib/currencyParser';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function Home() {
  const navigate = useNavigate();
  const { language, t } = useApp();
  const { closures, loading, deleteClosure } = useClosures();
  const categoryStore = useCategoryStore();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [newDialogOpen, setNewDialogOpen] = useState(false);

  const locale = language === 'pt' ? ptBR : enUS;

  const getMonthName = (month: number) => {
    const date = new Date(2024, month - 1);
    return format(date, 'MMMM', { locale });
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const handleNewClosure = () => {
    const existing = closures.find(c => c.month === selectedMonth && c.year === selectedYear);
    if (existing) {
      navigate(`/closure/${existing.id}`);
    } else {
      navigate(`/closure/new?month=${selectedMonth}&year=${selectedYear}`);
    }
    setNewDialogOpen(false);
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
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t('home.title')}</h2>
            <p className="text-muted-foreground">{t('home.subtitle')}</p>
          </div>
          <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="glow" size="lg">
                <Plus className="h-5 w-5" />
                {t('home.newClosure')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('home.selectPeriod')}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('home.month')}</label>
                  <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(m => (
                        <SelectItem key={m} value={String(m)}>
                          <span className="capitalize">{getMonthName(m)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('home.year')}</label>
                  <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(y => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleNewClosure} className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('home.startClosure')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : closures.length === 0 ? (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('home.empty')}</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">{t('home.emptyDesc')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {closures.map(closure => {
              const isComplete = closure.totalIncome > 0 && closure.totalExpenses > 0;
              return (
              <Card
                key={closure.id}
                className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
                onClick={() => navigate(`/closure/${closure.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg capitalize">
                        {getMonthName(closure.month)} {closure.year}
                      </CardTitle>
                      {isComplete ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-income/10 text-income">
                          <CheckCircle2 className="h-3 w-3" />
                          {t('home.complete')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                          <PenLine className="h-3 w-3" />
                          {t('home.draft')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); navigate(`/closure/${closure.id}`); }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('home.deleteTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('home.deleteDesc')}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteClosure(closure.id)}>
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {t('home.updatedAt')} {format(new Date(closure.updatedAt), 'dd/MM/yyyy HH:mm')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-income">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs text-muted-foreground">{t('dashboard.totalIncome')}</span>
                      </div>
                      <p className="font-mono font-bold text-lg text-income">
                        {formatCurrency(closure.totalIncome, language)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-expense">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-xs text-muted-foreground">{t('dashboard.totalExpenses')}</span>
                      </div>
                      <p className="font-mono font-bold text-lg text-expense">
                        {formatCurrency(closure.totalExpenses, language)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-investment">
                        <PiggyBank className="h-4 w-4" />
                        <span className="text-xs text-muted-foreground">{t('dashboard.netInvestment')}</span>
                      </div>
                      <p className="font-mono font-bold text-lg text-investment">
                        {formatCurrency(closure.totalInvestment, language)}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {closure.investedPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
