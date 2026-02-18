import { useState } from 'react';
import { Plus, Trash2, DollarSign, ArrowRight, ArrowLeft, BookmarkPlus, Sparkles, X } from 'lucide-react';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableColumnHeader } from '@/components/SortableColumnHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IncomeEntry } from '@/types/finance';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/currencyParser';
import { CategorizationRule } from '@/hooks/useCategorizationRules';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/SortableItem';

interface IncomeFormProps {
  incomes: IncomeEntry[];
  incomeTypes: string[];
  onAddIncome: (income: Omit<IncomeEntry, 'id'>) => void;
  onRemoveIncome: (id: string) => void;
  onUpdateIncomeType: (id: string, type: string) => void;
  onNext: () => void;
  onBack: () => void;
  rules?: CategorizationRule[];
  onAddRule?: (keyword: string, category: string) => Promise<void>;
  onRemoveRule?: (id: string) => Promise<void>;
  getIncomeTypeColor?: (name: string) => string;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export function IncomeForm({ incomes, incomeTypes, onAddIncome, onRemoveIncome, onUpdateIncomeType, onNext, onBack, rules = [], onAddRule, onRemoveRule, getIncomeTypeColor, onReorder }: IncomeFormProps) {
  const { language, t } = useApp();
  const [source, setSource] = useState('');
  const [type, setType] = useState<string>(incomeTypes[0] || 'Salary');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState(incomeTypes[0] || '');
  const [showRules, setShowRules] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const { sortedItems: sortedIncomes, sortConfig, toggleSort } = useTableSort(incomes);

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const categorizedCount = incomes.filter(i => i.type !== 'Other').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !amount) return;
    onAddIncome({
      source: source.trim(),
      type: type as any,
      amount: parseFloat(amount),
      date: date || undefined,
    });
    setSource('');
    setAmount('');
    setDate('');
  };

  const getTranslatedType = (incomeType: string) => {
    const key = `incomeType.${incomeType}`;
    const translated = t(key);
    return translated !== key ? translated : incomeType;
  };

  const getTypeColor = (name: string) => {
    return getIncomeTypeColor?.(name) || '#6b7280';
  };

  const handleAddRule = async () => {
    if (!newKeyword.trim() || !onAddRule) return;
    await onAddRule(newKeyword, newRuleCategory);
    setNewKeyword('');
  };

  const handleSaveRuleFromIncome = async (description: string, incType: string) => {
    if (!onAddRule) return;
    const keyword = description.trim().split(/\s+/)[0]?.toLowerCase();
    if (keyword && keyword.length >= 3) {
      await onAddRule(keyword, incType);
    }
  };

  const incomeRules = rules.filter(r => incomeTypes.includes(r.category));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;
    const oldIndex = incomes.findIndex(i => i.id === active.id);
    const newIndex = incomes.findIndex(i => i.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) onReorder(oldIndex, newIndex);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('income.title')}</h2>
        <p className="text-muted-foreground">{t('income.subtitle')}</p>
      </div>

      {/* Add manual income */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-income text-base">
            <Plus className="w-4 h-4" />
            {t('income.newEntry')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <div className="space-y-1 flex-1 min-w-[120px]">
              <label className="text-xs text-muted-foreground">{t('categorize.date')}</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-secondary border-border text-sm h-9" />
            </div>
            <div className="space-y-1 flex-[2] min-w-[160px]">
              <label className="text-xs text-muted-foreground">{t('income.source')}</label>
              <Input placeholder={t('income.sourcePlaceholder')} value={source} onChange={e => setSource(e.target.value)} className="bg-secondary border-border text-sm h-9" />
            </div>
            <div className="space-y-1 min-w-[130px]">
              <label className="text-xs text-muted-foreground">{t('income.type')}</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-secondary border-border text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {incomeTypes.map(t => (
                    <SelectItem key={t} value={t}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getTypeColor(t) }} />
                        {getTranslatedType(t)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 min-w-[120px]">
              <label className="text-xs text-muted-foreground">{t('income.amount')}</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{language === 'pt' ? 'R$' : '$'}</span>
                <Input type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="pl-7 bg-secondary border-border font-mono text-sm h-9" />
              </div>
            </div>
            <Button type="submit" variant="income" size="sm" className="h-9">
              <Plus className="w-4 h-4" />
              {t('income.addButton')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold font-mono text-income">{formatCurrency(totalIncome, language)}</p>
            <p className="text-xs text-muted-foreground">{t('income.total')}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold font-mono text-foreground">{incomes.length}</p>
            <p className="text-xs text-muted-foreground">{t('categorize.count')}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold font-mono text-primary">{categorizedCount}/{incomes.length}</p>
            <p className="text-xs text-muted-foreground">{t('income.type')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Auto-categorization Rules */}
      {onAddRule && onRemoveRule && (
        <Card className="border-primary/20">
          <CardHeader className="cursor-pointer" onClick={() => setShowRules(!showRules)}>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              {t('rules.title')}
              <span className="text-xs text-muted-foreground ml-auto">{incomeRules.length} {t('rules.count')}</span>
            </CardTitle>
          </CardHeader>
          {showRules && (
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder={t('rules.keywordPlaceholder')} value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} className="bg-secondary border-border text-sm" onKeyDown={(e) => e.key === 'Enter' && handleAddRule()} />
                <Select value={newRuleCategory} onValueChange={setNewRuleCategory}>
                  <SelectTrigger className="w-[160px] bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {incomeTypes.map(cat => (
                      <SelectItem key={cat} value={cat}>{getTranslatedType(cat)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleAddRule} disabled={!newKeyword.trim()}><BookmarkPlus className="w-4 h-4" /></Button>
              </div>
              {incomeRules.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {incomeRules.map(rule => (
                    <div key={rule.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs border border-border">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getTypeColor(rule.category) }} />
                      <span className="font-medium">{rule.keyword}</span>
                      <span className="text-muted-foreground">→ {getTranslatedType(rule.category)}</span>
                      <button onClick={() => onRemoveRule(rule.id)} className="ml-1 text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Income Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-income" />
            {t('income.entries')}
          </CardTitle>
          <CardDescription>
            {incomes.length === 0 ? t('income.noEntries') : `${incomes.length} ${t('import.transactions')}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incomes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t('income.addFirst')}</p>
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
                        <SortableColumnHeader label={t('categorize.description')} sortKey="source" currentKey={sortConfig.key} direction={sortConfig.direction} onSort={toggleSort} />
                        <SortableColumnHeader label={t('income.type')} sortKey="type" currentKey={sortConfig.key} direction={sortConfig.direction} onSort={toggleSort} />
                        <SortableColumnHeader label={t('categorize.amount')} sortKey="amount" currentKey={sortConfig.key} direction={sortConfig.direction} onSort={toggleSort} align="right" />
                        <th className="w-20"></th>
                      </tr>
                    </thead>
                    <SortableContext items={sortedIncomes.map(i => i.id)} strategy={verticalListSortingStrategy}>
                      <tbody className="divide-y divide-border">
                        {sortedIncomes.map(income => (
                          <SortableItem key={income.id} id={income.id} as="tr">
                            <td className="py-3 px-2 text-sm text-muted-foreground whitespace-nowrap">{income.date || '—'}</td>
                            <td className="py-3 px-2 text-sm text-foreground max-w-[200px] truncate">{income.source}</td>
                            <td className="py-3 px-2">
                              <Select value={income.type} onValueChange={v => onUpdateIncomeType(income.id, v)}>
                                <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary border-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                  {incomeTypes.map(t => (
                                    <SelectItem key={t} value={t}>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getTypeColor(t) }} />
                                        {getTranslatedType(t)}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 px-2 text-sm font-mono font-medium text-income text-right whitespace-nowrap">
                              {formatCurrency(income.amount, language)}
                            </td>
                            <td className="py-3 px-2 flex items-center gap-1">
                              {income.type !== 'Other' && onAddRule && (
                                <Button variant="ghost" size="icon" title={t('rules.saveRule')} onClick={() => handleSaveRuleFromIncome(income.source, income.type)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10">
                                  <BookmarkPlus className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => onRemoveIncome(income.id)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10">
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
                <span className="text-muted-foreground">{t('income.total')}</span>
                <span className="text-xl font-bold font-mono text-income">{formatCurrency(totalIncome, language)}</span>
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
        <Button onClick={onNext} disabled={incomes.length === 0}>
          <ArrowRight className="w-4 h-4" />
          {t('income.continue')}
        </Button>
      </div>
    </div>
  );
}
