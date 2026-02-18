import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { StepIndicator } from '@/components/StepIndicator';
import { IncomeForm } from '@/components/IncomeForm';
import { CSVImport } from '@/components/CSVImport';
import { ExpenseCategorization } from '@/components/ExpenseCategorization';
import { Dashboard } from '@/components/Dashboard';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { useCategoryStore } from '@/hooks/useCategoryStore';
import { useClosures } from '@/hooks/useClosures';
import { useCategorizationRules } from '@/hooks/useCategorizationRules';
import { generatePDFReport } from '@/lib/pdfExport';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  { id: 1, label: 'Import' },
  { id: 2, label: 'Income' },
  { id: 3, label: 'Categorize' },
  { id: 4, label: 'Summary' },
];

export default function Closure() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, t } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingData, setLoadingData] = useState(!!id);
  const [saving, setSaving] = useState(false);

  const month = id ? 0 : Number(searchParams.get('month') || new Date().getMonth() + 1);
  const year = id ? 0 : Number(searchParams.get('year') || new Date().getFullYear());
  const [closureMonth, setClosureMonth] = useState(month);
  const [closureYear, setClosureYear] = useState(year);

  const {
    incomes, expenses, summary,
    addIncome, removeIncome, addExpenses,
    updateExpenseCategory, updateIncomeType, removeExpense, clearAllExpenses,
    setIncomes, setExpenses,
  } = useFinanceStore();

  const categoryStore = useCategoryStore();
  const { saveClosure, loadClosure } = useClosures();
  const { autoCategorize, rules, addRule, removeRule } = useCategorizationRules();

  // Load existing closure data
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // Fetch closure metadata
        const { data: closureMeta } = await (await import('@/integrations/supabase/client')).supabase
          .from('monthly_closures')
          .select('month, year')
          .eq('id', id)
          .single();

        if (closureMeta) {
          setClosureMonth(closureMeta.month);
          setClosureYear(closureMeta.year);
        }

        const { incomes: loadedIncomes, expenses: loadedExpenses } = await loadClosure(id);
        setIncomes(loadedIncomes);
        setExpenses(loadedExpenses);
      } catch (err) {
        toast({ title: t('auth.error'), description: 'Failed to load closure', variant: 'destructive' });
      } finally {
        setLoadingData(false);
      }
    })();
  }, [id, loadClosure, setIncomes, setExpenses, t]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveClosure(closureMonth, closureYear, incomes, expenses, summary);
      toast({
        title: t('home.savedTitle'),
        description: t('home.savedDesc'),
      });
    } catch (err: any) {
      toast({
        title: t('auth.error'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    try {
      generatePDFReport(summary, incomes, expenses);
      toast({
        title: language === 'pt' ? 'Relatório Exportado' : 'Report Exported',
        description: language === 'pt' ? 'Seu relatório mensal foi baixado como PDF.' : 'Your monthly report has been downloaded as PDF.',
      });
    } catch {
      toast({
        title: language === 'pt' ? 'Exportação Falhou' : 'Export Failed',
        description: language === 'pt' ? 'Houve um erro ao gerar o PDF.' : 'There was an error generating the PDF.',
        variant: 'destructive',
      });
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <Header {...categoryStore} onAddCategory={categoryStore.addCategory} onRemoveCategory={categoryStore.removeCategory} onAddIncomeType={categoryStore.addIncomeType} onRemoveIncomeType={categoryStore.removeIncomeType} isDefaultCategory={categoryStore.isDefaultCategory} isDefaultIncomeType={categoryStore.isDefaultIncomeType} />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CSVImport
            categories={categoryStore.categories}
            onImport={(exps) => addExpenses(autoCategorize(exps))}
            onImportIncomes={(newIncomes) => {
              newIncomes.forEach(inc => addIncome(inc));
            }}
            onNext={() => setCurrentStep(2)}
            onBack={() => {}}
            hasExpenses={expenses.length > 0}
            onClearExpenses={clearAllExpenses}
            expenseCount={expenses.length}
          />
        );
      case 2:
        return (
          <IncomeForm
            incomes={incomes}
            incomeTypes={categoryStore.incomeTypes}
            onAddIncome={addIncome}
            onRemoveIncome={removeIncome}
            onUpdateIncomeType={updateIncomeType}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <ExpenseCategorization
            expenses={expenses}
            categories={categoryStore.categories}
            onUpdateCategory={updateExpenseCategory}
            onRemoveExpense={removeExpense}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
            rules={rules}
            onAddRule={addRule}
            onRemoveRule={removeRule}
          />
        );
      case 4:
        return (
          <Dashboard
            summary={summary}
            onExportPDF={handleExportPDF}
            onBack={() => setCurrentStep(3)}
            onSave={handleSave}
            saving={saving}
          />
        );
      default:
        return null;
    }
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
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            ← {t('home.backHome')}
          </Button>
          <span className="text-sm text-muted-foreground font-medium capitalize">
            {closureMonth}/{closureYear}
          </span>
        </div>
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
        <div className="mt-6">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
