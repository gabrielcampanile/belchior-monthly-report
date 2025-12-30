import { Wallet } from 'lucide-react';

export function Header() {
  const currentMonth = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Monthly Closure</h1>
            <p className="text-xs text-muted-foreground">Session-based finance tool</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{currentMonth}</p>
          <p className="text-xs text-muted-foreground">Current period</p>
        </div>
      </div>
    </header>
  );
}
