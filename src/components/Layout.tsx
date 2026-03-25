import { Home, BarChart3, Settings, LogOut, Wallet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

const navItems = [
  { path: '/', icon: Home, labelKey: 'nav.home' },
  { path: '/history', icon: BarChart3, labelKey: 'nav.history' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t } = useApp();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const displayName = user?.user_metadata?.full_name || user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast({ title: t('auth.error'), description: error.message, variant: 'destructive' });
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>
        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map(item => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]")} />
                  <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t('auth.logout')}</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  // Desktop: sidebar
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="group/sidebar fixed top-0 left-0 z-50 h-screen w-[68px] hover:w-[220px] transition-all duration-300 ease-in-out bg-card border-r border-border flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-border flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary flex-shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-foreground whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
            {t('app.title')}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
          {navItems.map(item => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-3 h-10 px-2.5 rounded-lg transition-all duration-200 group/item",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px] flex-shrink-0",
                  active && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                )} />
                <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                  {t(item.labelKey)}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-border px-3 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
              <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover/sidebar:opacity-100 flex-shrink-0"
              title={t('auth.logout')}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-[68px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
