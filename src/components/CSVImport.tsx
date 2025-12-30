import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, ArrowRight, AlertCircle, X, Plus, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpenseEntry } from '@/types/finance';
import { useApp } from '@/contexts/AppContext';
import { parseBRLCurrency, tryMergeCurrencyColumns, formatCurrency } from '@/lib/currencyParser';
import { format } from 'date-fns';

interface CSVImportProps {
  categories: string[];
  onImport: (expenses: Omit<ExpenseEntry, 'id'>[]) => void;
  onNext: () => void;
  onBack: () => void;
  hasExpenses: boolean;
  onClearExpenses: () => void;
  expenseCount: number;
}

export function CSVImport({ categories, onImport, onNext, onBack, hasExpenses, onClearExpenses, expenseCount }: CSVImportProps) {
  const { language, t } = useApp();
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{
    date: string;
    description: string;
    amount: string;
  }>({ date: '', description: '', amount: '' });
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Manual expense form
  const [manualDate, setManualDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [manualDesc, setManualDesc] = useState('');
  const [manualAmount, setManualAmount] = useState('');

  const parseCSV = useCallback((text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    return lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if ((char === ',' || char === ';') && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      
      if (parsed.length < 2) {
        setError('CSV file must have at least a header row and one data row');
        return;
      }

      setHeaders(parsed[0]);
      setCsvData(parsed.slice(1));

      // Auto-detect columns
      const headerLower = parsed[0].map(h => h.toLowerCase());
      const dateIdx = headerLower.findIndex(h => 
        h.includes('date') || h.includes('data') || h.includes('dt')
      );
      const descIdx = headerLower.findIndex(h => 
        h.includes('desc') || h.includes('descrição') || h.includes('descricao') || 
        h.includes('merchant') || h.includes('estabelecimento') || h.includes('nome')
      );
      const amountIdx = headerLower.findIndex(h => 
        h.includes('amount') || h.includes('valor') || h.includes('value') || 
        h.includes('total') || h.includes('quantia')
      );

      if (dateIdx !== -1) setMapping(m => ({ ...m, date: parsed[0][dateIdx] }));
      if (descIdx !== -1) setMapping(m => ({ ...m, description: parsed[0][descIdx] }));
      if (amountIdx !== -1) setMapping(m => ({ ...m, amount: parsed[0][amountIdx] }));
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!mapping.date || !mapping.description || !mapping.amount) {
      setError('Please map all required columns');
      return;
    }

    const dateIndex = headers.indexOf(mapping.date);
    const descIndex = headers.indexOf(mapping.description);
    const amountIndex = headers.indexOf(mapping.amount);

    const expenses: Omit<ExpenseEntry, 'id'>[] = csvData
      .filter(row => row.length > Math.max(dateIndex, descIndex, amountIndex))
      .map(row => {
        // Try to merge currency columns if needed (handles Brazilian format)
        const amountStr = tryMergeCurrencyColumns(row, amountIndex);
        const amount = Math.abs(parseBRLCurrency(amountStr));
        
        return {
          date: row[dateIndex],
          description: row[descIndex],
          amount,
          category: categories[categories.length - 1] as any, // Default to last category (Other)
        };
      })
      .filter(e => e.amount > 0 && e.description.trim());

    if (expenses.length === 0) {
      setError('No valid expenses found in CSV');
      return;
    }

    onImport(expenses);
    onNext();
  };

  const handleAddManualExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDate || !manualDesc.trim() || !manualAmount) return;

    const amount = parseFloat(manualAmount);
    if (isNaN(amount) || amount <= 0) return;

    onImport([{
      date: manualDate,
      description: manualDesc.trim(),
      amount: amount,
      category: categories[categories.length - 1] as any,
    }]);

    setManualDesc('');
    setManualAmount('');
  };

  const clearFile = () => {
    setCsvData([]);
    setHeaders([]);
    setMapping({ date: '', description: '', amount: '' });
    setFileName(null);
    setError(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('import.title')}</h2>
        <p className="text-muted-foreground">{t('import.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CSV Upload */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              {t('import.uploadCSV')}
            </CardTitle>
            <CardDescription>
              {t('import.supported')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            {!fileName ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all duration-200">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="mb-2 text-sm text-foreground">
                    <span className="font-semibold">{t('import.dragDrop')}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">CSV</p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {csvData.length} rows
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Column Mapping */}
            {headers.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="font-medium text-foreground">{t('import.mapping')}</h4>
                
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('import.dateColumn')}</Label>
                    <Select value={mapping.date} onValueChange={(v) => setMapping(m => ({ ...m, date: v }))}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder={t('import.selectColumn')} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {headers.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">{t('import.descColumn')}</Label>
                    <Select value={mapping.description} onValueChange={(v) => setMapping(m => ({ ...m, description: v }))}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder={t('import.selectColumn')} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {headers.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">{t('import.amountColumn')}</Label>
                    <Select value={mapping.amount} onValueChange={(v) => setMapping(m => ({ ...m, amount: v }))}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder={t('import.selectColumn')} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {headers.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preview */}
                {csvData.length > 0 && mapping.date && mapping.description && mapping.amount && (
                  <div className="pt-4">
                    <h4 className="font-medium text-foreground mb-2">{t('import.preview')}</h4>
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <thead className="bg-secondary">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('import.date')}</th>
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('import.description')}</th>
                            <th className="px-4 py-2 text-right font-medium text-muted-foreground">{t('income.amount')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(0, 3).map((row, i) => (
                            <tr key={i} className="border-t border-border">
                              <td className="px-4 py-2 text-foreground">{row[headers.indexOf(mapping.date)]}</td>
                              <td className="px-4 py-2 text-foreground truncate max-w-[150px]">{row[headers.indexOf(mapping.description)]}</td>
                              <td className="px-4 py-2 text-foreground text-right font-mono">
                                {formatCurrency(
                                  parseBRLCurrency(tryMergeCurrencyColumns(row, headers.indexOf(mapping.amount))),
                                  language
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleImport} 
                  disabled={!mapping.date || !mapping.description || !mapping.amount}
                  variant="expense"
                  className="w-full"
                >
                  <ArrowRight className="w-4 h-4" />
                  {t('import.confirmImport')} ({csvData.length} {t('import.transactions')})
                </Button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Plus className="w-5 h-5" />
              {t('import.manualEntry')}
            </CardTitle>
            <CardDescription>{t('import.manualDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddManualExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expense-date">{t('import.date')}</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expense-date"
                    type="date"
                    className="pl-10 bg-secondary border-border"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-desc">{t('import.description')}</Label>
                <Input
                  id="expense-desc"
                  placeholder={t('import.descPlaceholder')}
                  className="bg-secondary border-border"
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-amount">{t('income.amount')}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {language === 'pt' ? 'R$' : '$'}
                  </span>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-9 bg-secondary border-border font-mono"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" variant="expense">
                <Plus className="w-4 h-4" />
                {t('import.addExpense')}
              </Button>
            </form>

            {hasExpenses && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {expenseCount} {t('import.expensesImported')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={onClearExpenses}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('import.clearAll')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          {t('import.back')}
        </Button>
        <Button onClick={onNext} disabled={!hasExpenses}>
          <ArrowRight className="w-4 h-4" />
          {t('import.continue')}
        </Button>
      </div>
    </div>
  );
}
