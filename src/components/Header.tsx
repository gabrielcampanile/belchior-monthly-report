import { Calculator, LogOut, Home, BarChart3, Settings, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
// Settings page replaces the dialog
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
  const navigate = useNavigate();
  const location = useLocation();
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

        <nav className="hidden sm:flex items-center gap-1">
          <Button
            variant={location.pathname === '/' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => navigate('/')}
            className="gap-1.5"
          >
            <Home className="h-4 w-4" />
            {t('nav.home')}
          </Button>
          <Button
            variant={location.pathname === '/history' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => navigate('/history')}
            className="gap-1.5"
          >
            <BarChart3 className="h-4 w-4" />
            {t('nav.history')}
          </Button>
          <Button
            variant={location.pathname === '/investments' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => navigate('/investments')}
            className="gap-1.5"
          >
            <TrendingUp className="h-4 w-4" />
            {t('nav.investments')}
          </Button>
          <Button
            variant={location.pathname === '/settings' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => navigate('/settings')}
            className="gap-1.5"
          >
            <Settings className="h-4 w-4" />
            {t('nav.settings')}
          </Button>
        </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground capitalize">{currentMonth}</p>
            <p className="text-xs text-muted-foreground">{t('app.currentPeriod')}</p>
          </div>

          {/* Removed SettingsDialog - now using /settings page */}

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
