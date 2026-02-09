import { useState } from 'react';
import { Trash2, Tag, ArrowRight, BarChart3, ArrowLeft, BookmarkPlus, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ExpenseEntry, CATEGORY_COLORS, ExpenseCategory } from '@/types/finance';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/currencyParser';
import { CategorizationRule } from '@/hooks/useCategorizationRules';

interface ExpenseCategorizationProps {
  expenses: ExpenseEntry[];
  categories: string[];
  onUpdateCategory: (id: string, category: string) => void;
  onRemoveExpense: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  rules: CategorizationRule[];
  onAddRule: (keyword: string, category: string) => Promise<void>;
  onRemoveRule: (id: string) => Promise<void>;
}

export function ExpenseCategorization({
  expenses,
  categories,
  onUpdateCategory,
  onRemoveExpense,
  onNext,
  onBack,
  rules,
  onAddRule,
  onRemoveRule,
}: ExpenseCategorizationProps) {
  const { language, t } = useApp();
  const [newKeyword, setNewKeyword] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState(categories[0] || '');
  const [showRules, setShowRules] = useState(false);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categorizedCount = expenses.filter(e => e.category !== 'Other').length;

  const getTranslatedCategory = (category: string) => {
    const key = `category.${category}`;
    const translated = t(key);
    return translated !== key ? translated : category;
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category as ExpenseCategory] || '#6b7280';
  };

  const handleAddRule = async () => {
    if (!newKeyword.trim()) return;
    await onAddRule(newKeyword, newRuleCategory);
    setNewKeyword('');
  };

  const handleSaveRuleFromExpense = async (description: string, category: string) => {
    // Extract a keyword from the description (first meaningful word)
    const keyword = description.trim().split(/\s+/)[0]?.toLowerCase();
    if (keyword && keyword.length >= 3) {
      await onAddRule(keyword, category);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('categorize.title')}</h2>
        <p className="text-muted-foreground">{t('categorize.subtitle')}</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold font-mono text-expense">
              {formatCurrency(totalExpenses, language)}
            </p>
            <p className="text-xs text-muted-foreground">{t('categorize.total')}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold font-mono text-foreground">
              {expenses.length}
            </p>
            <p className="text-xs text-muted-foreground">{t('categorize.count')}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold font-mono text-primary">
              {categorizedCount}/{expenses.length}
            </p>
            <p className="text-xs text-muted-foreground">{t('categorize.category')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Auto-categorization Rules */}
      <Card className="border-primary/20">
        <CardHeader className="cursor-pointer" onClick={() => setShowRules(!showRules)}>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            {t('rules.title')}
            <span className="text-xs text-muted-foreground ml-auto">
              {rules.length} {t('rules.count')}
            </span>
          </CardTitle>
        </CardHeader>
        {showRules && (
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t('rules.keywordPlaceholder')}
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="bg-secondary border-border text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
              />
              <Select value={newRuleCategory} onValueChange={setNewRuleCategory}>
                <SelectTrigger className="w-[160px] bg-secondary border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {getTranslatedCategory(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAddRule} disabled={!newKeyword.trim()}>
                <BookmarkPlus className="w-4 h-4" />
              </Button>
            </div>
            {rules.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {rules.map(rule => (
                  <div key={rule.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs border border-border">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(rule.category) }} />
                    <span className="font-medium">{rule.keyword}</span>
                    <span className="text-muted-foreground">→ {getTranslatedCategory(rule.category)}</span>
                    <button onClick={() => onRemoveRule(rule.id)} className="ml-1 text-muted-foreground hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Expenses Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            {t('categorize.title')}
          </CardTitle>
          <CardDescription>
            {expenses.length} {t('import.transactions')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t('categorize.noExpenses')}</p>
              <Button variant="outline" className="mt-4" onClick={onBack}>
                {t('categorize.importFirst')}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('categorize.date')}</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('categorize.description')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('categorize.amount')}</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('categorize.category')}</th>
                    <th className="w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="group hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-2 text-sm text-muted-foreground whitespace-nowrap">{expense.date}</td>
                      <td className="py-3 px-2 text-sm text-foreground max-w-[200px] truncate">{expense.description}</td>
                      <td className="py-3 px-2 text-sm font-mono font-medium text-expense text-right whitespace-nowrap">
                        {formatCurrency(expense.amount, language)}
                      </td>
                      <td className="py-3 px-2">
                        <Select
                          value={expense.category}
                          onValueChange={(v) => onUpdateCategory(expense.id, v)}
                        >
                          <SelectTrigger className="w-[180px] h-8 text-xs bg-secondary border-border">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(expense.category) }} />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }} />
                                  {getTranslatedCategory(cat)}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-2 flex items-center gap-1">
                        {expense.category !== 'Other' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title={t('rules.saveRule')}
                            onClick={() => handleSaveRuleFromExpense(expense.description, expense.category)}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <BookmarkPlus className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveExpense(expense.id)}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          {t('categorize.back')}
        </Button>
        <Button onClick={onNext} disabled={expenses.length === 0}>
          <ArrowRight className="w-4 h-4" />
          {t('categorize.continue')}
        </Button>
      </div>
    </div>
  );
}
