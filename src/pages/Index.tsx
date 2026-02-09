import { useState } from 'react';
import { Header } from '@/components/Header';
import { StepIndicator } from '@/components/StepIndicator';
import { IncomeForm } from '@/components/IncomeForm';
import { CSVImport } from '@/components/CSVImport';
import { ExpenseCategorization } from '@/components/ExpenseCategorization';
import { Dashboard } from '@/components/Dashboard';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { useCategoryStore } from '@/hooks/useCategoryStore';
import { useCategorizationRules } from '@/hooks/useCategorizationRules';
import { generatePDFReport } from '@/lib/pdfExport';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

const STEPS = [
  { id: 1, label: 'Income' },
  { id: 2, label: 'Import' },
  { id: 3, label: 'Categorize' },
  { id: 4, label: 'Summary' },
];

const Index = () => {
  const { language } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const {
    incomes,
    expenses,
    summary,
    addIncome,
    removeIncome,
    addExpenses,
    updateExpenseCategory,
    removeExpense,
    clearAllExpenses,
  } = useFinanceStore();
  const { autoCategorize, rules, addRule, removeRule } = useCategorizationRules();

  const {
    categories,
    incomeTypes,
    addCategory,
    removeCategory,
    addIncomeType,
    removeIncomeType,
    isDefaultCategory,
    isDefaultIncomeType,
  } = useCategoryStore();

  const handleExportPDF = () => {
    try {
      generatePDFReport(summary, incomes, expenses);
      toast({
        title: language === 'pt' ? "Relatório Exportado" : "Report Exported",
        description: language === 'pt' 
          ? "Seu relatório mensal foi baixado como PDF." 
          : "Your monthly report has been downloaded as PDF.",
      });
    } catch (error) {
      toast({
        title: language === 'pt' ? "Exportação Falhou" : "Export Failed",
        description: language === 'pt' 
          ? "Houve um erro ao gerar o PDF." 
          : "There was an error generating the PDF.",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <IncomeForm
            incomes={incomes}
            incomeTypes={incomeTypes}
            onAddIncome={addIncome}
            onRemoveIncome={removeIncome}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <CSVImport
            categories={categories}
            onImport={addExpenses}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
            hasExpenses={expenses.length > 0}
            onClearExpenses={clearAllExpenses}
            expenseCount={expenses.length}
          />
        );
      case 3:
        return (
          <ExpenseCategorization
            expenses={expenses}
            categories={categories}
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        categories={categories}
        incomeTypes={incomeTypes}
        onAddCategory={addCategory}
        onRemoveCategory={removeCategory}
        onAddIncomeType={addIncomeType}
        onRemoveIncomeType={removeIncomeType}
        isDefaultCategory={isDefaultCategory}
        isDefaultIncomeType={isDefaultIncomeType}
      />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
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
};

export default Index;
