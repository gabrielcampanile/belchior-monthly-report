import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  const { t } = useApp();

  const getTranslatedLabel = (label: string) => {
    const key = `steps.${label.toLowerCase()}`;
    const translated = t(key);
    return translated !== key ? translated : label;
  };

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 py-6 overflow-x-auto">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <button
            onClick={() => onStepClick(step.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
              currentStep === step.id
                ? "bg-primary/20 text-primary"
                : currentStep > step.id
                ? "text-income cursor-pointer hover:bg-secondary"
                : "text-muted-foreground cursor-pointer hover:bg-secondary"
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200",
                currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : currentStep > step.id
                  ? "bg-income text-income-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {currentStep > step.id ? (
                <Check className="w-4 h-4" />
              ) : (
                step.id
              )}
            </div>
            <span className="text-sm font-medium hidden sm:inline">
              {getTranslatedLabel(step.label)}
            </span>
          </button>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-8 md:w-12 h-0.5 mx-1",
                currentStep > step.id ? "bg-income" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
