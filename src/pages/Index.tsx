import { useState } from 'react';
import { Header } from '@/components/Header';
import { StepIndicator } from '@/components/StepIndicator';
import { IncomeForm } from '@/components/IncomeForm';
import { CSVImport } from '@/components/CSVImport';
import { ExpenseCategorization } from '@/components/ExpenseCategorization';
import { Dashboard } from '@/components/Dashboard';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { generatePDFReport } from '@/lib/pdfExport';
import { toast } from '@/hooks/use-toast';

const STEPS = [
  { id: 1, label: 'Income' },
  { id: 2, label: 'Import' },
  { id: 3, label: 'Categorize' },
  { id: 4, label: 'Summary' },
];

const Index = () => {
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
  } = useFinanceStore();

  const handleExportPDF = () => {
    try {
      generatePDFReport(summary, incomes, expenses);
      toast({
        title: "Report Exported",
        description: "Your monthly report has been downloaded as PDF.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF.",
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
            onAddIncome={addIncome}
            onRemoveIncome={removeIncome}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <CSVImport
            onImport={addExpenses}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
            hasExpenses={expenses.length > 0}
          />
        );
      case 3:
        return (
          <ExpenseCategorization
            expenses={expenses}
            onUpdateCategory={updateExpenseCategory}
            onRemoveExpense={removeExpense}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
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
      <Header />
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
