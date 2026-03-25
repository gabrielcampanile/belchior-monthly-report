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
    <div className="flex items-center justify-center py-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <button
            onClick={() => onStepClick(step.id)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200",
              currentStep === step.id
                ? "text-primary"
                : currentStep > step.id
                ? "text-income cursor-pointer hover:bg-muted/30"
                : "text-muted-foreground cursor-pointer hover:bg-muted/30"
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                currentStep === step.id
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                  : currentStep > step.id
                  ? "bg-income/15 text-income border border-income/30"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {currentStep > step.id ? (
                <Check className="w-3.5 h-3.5" />
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
                "w-8 md:w-16 h-px mx-1 transition-colors duration-300",
                currentStep > step.id ? "bg-income/40" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
