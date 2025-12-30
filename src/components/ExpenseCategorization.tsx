import { Trash2, Tag, ArrowRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpenseEntry, ExpenseCategory, EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/types/finance';

interface ExpenseCategorizationProps {
  expenses: ExpenseEntry[];
  onUpdateCategory: (id: string, category: ExpenseCategory) => void;
  onRemoveExpense: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ExpenseCategorization({
  expenses,
  onUpdateCategory,
  onRemoveExpense,
  onNext,
  onBack,
}: ExpenseCategorizationProps) {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categorizedCount = expenses.filter(e => e.category !== 'Other').length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Categorize Expenses</h2>
        <p className="text-muted-foreground">
          Assign a category to each expense for better insights
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold font-mono text-expense">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-xs text-muted-foreground">Total Expenses</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold font-mono text-foreground">
              {expenses.length}
            </p>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold font-mono text-primary">
              {categorizedCount}/{expenses.length}
            </p>
            <p className="text-xs text-muted-foreground">Categorized</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Expense Entries
          </CardTitle>
          <CardDescription>
            Click on each category dropdown to assign categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No expenses imported yet</p>
              <Button variant="outline" className="mt-4" onClick={onBack}>
                Go back to import
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="group hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-2 text-sm text-muted-foreground whitespace-nowrap">
                        {expense.date}
                      </td>
                      <td className="py-3 px-2 text-sm text-foreground max-w-[200px] truncate">
                        {expense.description}
                      </td>
                      <td className="py-3 px-2 text-sm font-mono font-medium text-expense text-right whitespace-nowrap">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="py-3 px-2">
                        <Select 
                          value={expense.category} 
                          onValueChange={(v) => onUpdateCategory(expense.id, v as ExpenseCategory)}
                        >
                          <SelectTrigger className="w-[180px] h-8 text-xs bg-secondary border-border">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                              />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {EXPENSE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                                  />
                                  {cat}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-2">
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
          Back to Import
        </Button>
        <Button onClick={onNext} disabled={expenses.length === 0}>
          <ArrowRight className="w-4 h-4" />
          View Dashboard
        </Button>
      </div>
    </div>
  );
}
