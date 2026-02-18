import { useState } from 'react';
import { Plus, Trash2, Tag, ArrowRight, BarChart3, ArrowLeft, BookmarkPlus, Sparkles, X } from 'lucide-react';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableColumnHeader } from '@/components/SortableColumnHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ExpenseEntry, CATEGORY_COLORS, ExpenseCategory } from '@/types/finance';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/currencyParser';
import { CategorizationRule } from '@/hooks/useCategorizationRules';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/SortableItem';

interface ExpenseCategorizationProps {
  expenses: ExpenseEntry[];
  categories: string[];
  onUpdateCategory: (id: string, category: string) => void;
  onRemoveExpense: (id: string) => void;
  onAddExpenses: (expenses: Omit<ExpenseEntry, 'id'>[]) => void;
  onNext: () => void;
  onBack: () => void;
  rules: CategorizationRule[];
  onAddRule: (keyword: string, category: string) => Promise<void>;
  onRemoveRule: (id: string) => Promise<void>;
  getCategoryColor?: (name: string) => string;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export function ExpenseCategorization({
  expenses,
  categories,
  onUpdateCategory,
  onRemoveExpense,
  onAddExpenses,
  onNext,
  onBack,
  rules,
  onAddRule,
  onRemoveRule,
  getCategoryColor: getCategoryColorProp,
  onReorder,
}: ExpenseCategorizationProps) {
  const { language, t } = useApp();
  const [newKeyword, setNewKeyword] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState(categories[0] || '');
  const [showRules, setShowRules] = useState(false);

  const [manualDate, setManualDate] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualCategory, setManualCategory] = useState<string>(categories[0] || 'Other');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const { sortedItems: sortedExpenses, sortConfig, toggleSort } = useTableSort(expenses);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categorizedCount = expenses.filter(e => e.category !== 'Other').length;

  const getTranslatedCategory = (category: string) => {
    const key = `category.${category}`;
    const translated = t(key);
    return translated !== key ? translated : category;
  };

  const getCategoryColor = (category: string) => {
    if (getCategoryColorProp) return getCategoryColorProp(category);
    return CATEGORY_COLORS[category as ExpenseCategory] || '#6b7280';
  };

  const handleAddRule = async () => {
    if (!newKeyword.trim()) return;
    await onAddRule(newKeyword, newRuleCategory);
    setNewKeyword('');
  };

  const handleSaveRuleFromExpense = async (description: string, category: string) => {
    const keyword = description.trim().split(/\s+/)[0]?.toLowerCase();
    if (keyword && keyword.length >= 3) {
      await onAddRule(keyword, category);
    }
  };

  const handleAddManualExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDesc.trim() || !manualAmount) return;
    onAddExpenses([{
      date: manualDate || new Date().toISOString().split('T')[0],
      description: manualDesc.trim(),
      amount: parseFloat(manualAmount),
      category: manualCategory as ExpenseCategory,
    }]);
    setManualDesc('');
    setManualAmount('');
    setManualDate('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;
    const oldIndex = expenses.findIndex(e => e.id === active.id);
    const newIndex = expenses.findIndex(e => e.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) onReorder(oldIndex, newIndex);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('expenses.title')}</h2>
        <p className="text-muted-foreground">{t('expenses.subtitle')}</p>
      </div>

      {/* Add manual expense */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-expense text-base">
            <Plus className="w-4 h-4" />
            {t('expenses.newEntry')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddManualExpense} className="flex flex-wrap items-end gap-3">
            <div className="space-y-1 flex-1 min-w-[120px]">
              <label className="text-xs text-muted-foreground">{t('categorize.date')}</label>
              <Input type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} className="bg-secondary border-border text-sm h-9" />
            </div>
            <div className="space-y-1 flex-[2] min-w-[160px]">
              <label className="text-xs text-muted-foreground">{t('categorize.description')}</label>
              <Input placeholder={t('import.descPlaceholder')} value={manualDesc} onChange={e => setManualDesc(e.target.value)} className="bg-secondary border-border text-sm h-9" />
            </div>
            <div className="space-y-1 min-w-[130px]">
              <label className="text-xs text-muted-foreground">{t('categorize.category')}</label>
              <Select value={manualCategory} onValueChange={setManualCategory}>
                <SelectTrigger className="bg-secondary border-border text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }} />
                        {getTranslatedCategory(cat)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 min-w-[120px]">
              <label className="text-xs text-muted-foreground">{t('categorize.amount')}</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{language === 'pt' ? 'R$' : '$'}</span>
                <Input type="number" step="0.01" min="0" placeholder="0.00" value={manualAmount} onChange={e => setManualAmount(e.target.value)} className="pl-7 bg-secondary border-border font-mono text-sm h-9" />
              </div>
            </div>
            <Button type="submit" variant="destructive" size="sm" className="h-9">
              <Plus className="w-4 h-4" />
              {t('expenses.addButton')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold font-mono text-expense">{formatCurrency(totalExpenses, language)}</p>
            <p className="text-xs text-muted-foreground">{t('categorize.total')}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold font-mono text-foreground">{expenses.length}</p>
            <p className="text-xs text-muted-foreground">{t('categorize.count')}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold font-mono text-primary">{categorizedCount}/{expenses.length}</p>
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
            <span className="text-xs text-muted-foreground ml-auto">{rules.length} {t('rules.count')}</span>
          </CardTitle>
        </CardHeader>
        {showRules && (
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder={t('rules.keywordPlaceholder')} value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} className="bg-secondary border-border text-sm" onKeyDown={(e) => e.key === 'Enter' && handleAddRule()} />
              <Select value={newRuleCategory} onValueChange={setNewRuleCategory}>
                <SelectTrigger className="w-[160px] bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{getTranslatedCategory(cat)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAddRule} disabled={!newKeyword.trim()}><BookmarkPlus className="w-4 h-4" /></Button>
            </div>
            {rules.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {rules.map(rule => (
                  <div key={rule.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs border border-border">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(rule.category) }} />
                    <span className="font-medium">{rule.keyword}</span>
                    <span className="text-muted-foreground">→ {getTranslatedCategory(rule.category)}</span>
                    <button onClick={() => onRemoveRule(rule.id)} className="ml-1 text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
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
            <Tag className="w-5 h-5 text-expense" />
            {t('expenses.entries')}
          </CardTitle>
          <CardDescription>{expenses.length} {t('import.transactions')}</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t('categorize.noExpenses')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="w-8"></th>
                        <SortableColumnHeader label={t('categorize.date')} sortKey="date" currentKey={sortConfig.key} direction={sortConfig.direction} onSort={toggleSort} />
                        <SortableColumnHeader label={t('categorize.description')} sortKey="description" currentKey={sortConfig.key} direction={sortConfig.direction} onSort={toggleSort} />
                        <SortableColumnHeader label={t('categorize.category')} sortKey="category" currentKey={sortConfig.key} direction={sortConfig.direction} onSort={toggleSort} />
                        <SortableColumnHeader label={t('categorize.amount')} sortKey="amount" currentKey={sortConfig.key} direction={sortConfig.direction} onSort={toggleSort} align="right" />
                        <th className="w-20"></th>
                      </tr>
                    </thead>
                    <SortableContext items={sortedExpenses.map(e => e.id)} strategy={verticalListSortingStrategy}>
                      <tbody className="divide-y divide-border">
                        {sortedExpenses.map((expense) => (
                          <SortableItem key={expense.id} id={expense.id} as="tr">
                            <td className="py-3 px-2 text-sm text-muted-foreground whitespace-nowrap">{expense.date}</td>
                            <td className="py-3 px-2 text-sm text-foreground max-w-[200px] truncate">{expense.description}</td>
                            <td className="py-3 px-2">
                              <Select value={expense.category} onValueChange={(v) => onUpdateCategory(expense.id, v)}>
                                <SelectTrigger className="w-[180px] h-8 text-xs bg-secondary border-border">
                                  <SelectValue />
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
                            <td className="py-3 px-2 text-sm font-mono font-medium text-expense text-right whitespace-nowrap">
                              {formatCurrency(expense.amount, language)}
                            </td>
                            <td className="py-3 px-2 flex items-center gap-1">
                              {expense.category !== 'Other' && (
                                <Button variant="ghost" size="icon" title={t('rules.saveRule')} onClick={() => handleSaveRuleFromExpense(expense.description, expense.category)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10">
                                  <BookmarkPlus className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => onRemoveExpense(expense.id)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </SortableItem>
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                </DndContext>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-muted-foreground">{t('categorize.total')}</span>
                <span className="text-xl font-bold font-mono text-expense">{formatCurrency(totalExpenses, language)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          {t('categorize.back')}
        </Button>
        <Button onClick={onNext}>
          <ArrowRight className="w-4 h-4" />
          {t('categorize.continue')}
        </Button>
      </div>
    </div>
  );
}
