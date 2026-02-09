import { Calculator, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useApp } from '@/contexts/AppContext';
import { SettingsDialog } from '@/components/SettingsDialog';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';

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
  const { user, signOut } = useAuth();
  const currentMonth = format(
    new Date(), 
    'MMMM yyyy', 
    { locale: language === 'pt' ? ptBR : enUS }
  );

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast({
        title: t('auth.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

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
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
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

          {user && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title={t('auth.logout')}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
