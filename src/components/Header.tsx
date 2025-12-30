import { Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useApp } from '@/contexts/AppContext';
import { SettingsDialog } from '@/components/SettingsDialog';

interface HeaderProps {
  categories: string[];
  incomeTypes: string[];
  onAddCategory: (name: string) => boolean;
  onRemoveCategory: (name: string) => boolean;
  onAddIncomeType: (name: string) => boolean;
  onRemoveIncomeType: (name: string) => boolean;
  isDefaultCategory: (name: string) => boolean;
  isDefaultIncomeType: (name: string) => boolean;
}

export function Header({
  categories,
  incomeTypes,
  onAddCategory,
  onRemoveCategory,
  onAddIncomeType,
  onRemoveIncomeType,
  isDefaultCategory,
  isDefaultIncomeType,
}: HeaderProps) {
  const { language, t } = useApp();
  const currentMonth = format(
    new Date(), 
    'MMMM yyyy', 
    { locale: language === 'pt' ? ptBR : enUS }
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{t('app.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('app.subtitle')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground capitalize">{currentMonth}</p>
            <p className="text-xs text-muted-foreground">{t('app.currentPeriod')}</p>
          </div>
          <SettingsDialog
            categories={categories}
            incomeTypes={incomeTypes}
            onAddCategory={onAddCategory}
            onRemoveCategory={onRemoveCategory}
            onAddIncomeType={onAddIncomeType}
            onRemoveIncomeType={onRemoveIncomeType}
            isDefaultCategory={isDefaultCategory}
            isDefaultIncomeType={isDefaultIncomeType}
          />
        </div>
      </div>
    </header>
  );
}
