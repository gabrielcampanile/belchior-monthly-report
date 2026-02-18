import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, ArrowRight, AlertCircle, X, CreditCard, Building2, FileText, DollarSign, Tags, BarChart3, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpenseEntry, IncomeEntry } from '@/types/finance';
import { useApp } from '@/contexts/AppContext';
import { parseBRLCurrency, tryMergeCurrencyColumns, formatCurrency } from '@/lib/currencyParser';

type FileType = 'credit_card' | 'bank_statement';

interface CSVImportProps {
  categories: string[];
  onImport: (expenses: Omit<ExpenseEntry, 'id'>[]) => void;
  onImportIncomes?: (incomes: Omit<IncomeEntry, 'id'>[]) => void;
  onNext: () => void;
  onBack: () => void;
  hasExpenses: boolean;
  onClearExpenses: () => void;
  expenseCount: number;
  incomeCount?: number;
}

export function CSVImport({ categories, onImport, onImportIncomes, onNext, onBack, hasExpenses, onClearExpenses, expenseCount, incomeCount = 0 }: CSVImportProps) {
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
  const [fileType, setFileType] = useState<FileType>('credit_card');

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

    const rows = csvData
      .filter(row => row.length > Math.max(dateIndex, descIndex, amountIndex))
      .map(row => {
        const amountStr = tryMergeCurrencyColumns(row, amountIndex);
        const rawAmount = parseBRLCurrency(amountStr);
        return {
          date: row[dateIndex],
          description: row[descIndex],
          rawAmount,
        };
      })
      .filter(r => r.rawAmount !== 0 && r.description.trim());

    if (rows.length === 0) {
      setError(t('import.noValid'));
      return;
    }

    if (fileType === 'credit_card') {
      const expenses: Omit<ExpenseEntry, 'id'>[] = rows.map(r => ({
        date: r.date,
        description: r.description,
        amount: Math.abs(r.rawAmount),
        category: categories[categories.length - 1] as any,
      }));
      onImport(expenses);
    } else {
      const expenses: Omit<ExpenseEntry, 'id'>[] = [];
      const incomes: Omit<IncomeEntry, 'id'>[] = [];

      for (const r of rows) {
        if (r.rawAmount < 0) {
          expenses.push({
            date: r.date,
            description: r.description,
            amount: Math.abs(r.rawAmount),
            category: categories[categories.length - 1] as any,
          });
        } else {
          incomes.push({
            date: r.date,
            source: r.description,
            type: 'Other',
            amount: r.rawAmount,
          });
        }
      }

      if (expenses.length > 0) onImport(expenses);
      if (incomes.length > 0 && onImportIncomes) onImportIncomes(incomes);
    }

    // Clear file after import so user can import another
    clearFile();
  };

  const clearFile = () => {
    setCsvData([]);
    setHeaders([]);
    setMapping({ date: '', description: '', amount: '' });
    setFileName(null);
    setError(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const totalImported = expenseCount + incomeCount;

  const previewRows = csvData.slice(0, 5).map(row => {
    if (!mapping.date || !mapping.description || !mapping.amount) return null;
    const dateIndex = headers.indexOf(mapping.date);
    const descIndex = headers.indexOf(mapping.description);
    const amountIndex = headers.indexOf(mapping.amount);
    if (row.length <= Math.max(dateIndex, descIndex, amountIndex)) return null;
    const amountStr = tryMergeCurrencyColumns(row, amountIndex);
    const rawAmount = parseBRLCurrency(amountStr);
    return {
      date: row[dateIndex],
      description: row[descIndex],
      rawAmount,
    };
  }).filter(Boolean) as { date: string; description: string; rawAmount: number }[];

  const steps = [
    {
      icon: FileText,
      title: t('import.step1Title'),
      description: t('import.step1Desc'),
    },
    {
      icon: DollarSign,
      title: t('import.step2Title'),
      description: t('import.step2Desc'),
    },
    {
      icon: Tags,
      title: t('import.step3Title'),
      description: t('import.step3Desc'),
    },
    {
      icon: BarChart3,
      title: t('import.step4Title'),
      description: t('import.step4Desc'),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('import.welcomeTitle')}</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">{t('import.welcomeSubtitle')}</p>
      </div>

      {/* Step-by-step guide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex flex-col items-center text-center p-4 rounded-xl border transition-colors ${
              i === 0 ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-secondary/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              i === 0 ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              <step.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground mb-1">
              {language === 'pt' ? `Passo ${i + 1}` : `Step ${i + 1}`}
            </span>
            <span className="text-sm font-medium text-foreground">{step.title}</span>
            <span className="text-xs text-muted-foreground mt-1">{step.description}</span>
          </div>
        ))}
      </div>

      {/* Import Card */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            {t('import.uploadCSV')}
          </CardTitle>
          <CardDescription>{t('import.supported')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Type Toggle */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">{t('import.fileType')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={fileType === 'credit_card' ? 'default' : 'outline'}
                size="sm"
                className="gap-2 h-10"
                onClick={() => setFileType('credit_card')}
              >
                <CreditCard className="h-4 w-4" />
                {t('import.creditCard')}
              </Button>
              <Button
                type="button"
                variant={fileType === 'bank_statement' ? 'default' : 'outline'}
                size="sm"
                className="gap-2 h-10"
                onClick={() => setFileType('bank_statement')}
              >
                <Building2 className="h-4 w-4" />
                {t('import.bankStatement')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {fileType === 'credit_card' ? t('import.creditCardDesc') : t('import.bankStatementDesc')}
            </p>
          </div>

          {/* Upload Area */}
          {!fileName ? (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all duration-200">
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
              {previewRows.length > 0 && (
                <div className="pt-4">
                  <h4 className="font-medium text-foreground mb-2">{t('import.preview')}</h4>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('import.date')}</th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('import.description')}</th>
                          <th className="px-4 py-2 text-right font-medium text-muted-foreground">{t('income.amount')}</th>
                          {fileType === 'bank_statement' && (
                            <th className="px-4 py-2 text-center font-medium text-muted-foreground">{t('import.type')}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => {
                          const isIncome = fileType === 'bank_statement' && row.rawAmount > 0;
                          return (
                            <tr key={i} className="border-t border-border">
                              <td className="px-4 py-2 text-foreground">{row.date}</td>
                              <td className="px-4 py-2 text-foreground truncate max-w-[150px]">{row.description}</td>
                              <td className={`px-4 py-2 text-right font-mono ${isIncome ? 'text-income' : 'text-expense'}`}>
                                {isIncome ? '+' : ''}{formatCurrency(row.rawAmount, language)}
                              </td>
                              {fileType === 'bank_statement' && (
                                <td className="px-4 py-2 text-center">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    isIncome 
                                      ? 'bg-income/10 text-income' 
                                      : 'bg-expense/10 text-expense'
                                  }`}>
                                    {isIncome ? t('import.incomeLabel') : t('import.expenseLabel')}
                                  </span>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import summary for bank statement */}
              {fileType === 'bank_statement' && previewRows.length > 0 && (
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-income" />
                    <span className="text-muted-foreground">
                      {csvData.filter(row => {
                        const idx = headers.indexOf(mapping.amount);
                        return idx >= 0 && parseBRLCurrency(tryMergeCurrencyColumns(row, idx)) > 0;
                      }).length} {t('import.incomeLabel')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-expense" />
                    <span className="text-muted-foreground">
                      {csvData.filter(row => {
                        const idx = headers.indexOf(mapping.amount);
                        return idx >= 0 && parseBRLCurrency(tryMergeCurrencyColumns(row, idx)) < 0;
                      }).length} {t('import.expenseLabel')}
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleImport} 
                disabled={!mapping.date || !mapping.description || !mapping.amount}
                variant="default"
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

      {/* Imported status */}
      {totalImported > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary" />
              <div className="text-sm">
                <span className="font-medium text-foreground">
                  {totalImported} {t('import.expensesImported')}
                </span>
                {expenseCount > 0 && incomeCount > 0 && (
                  <span className="text-muted-foreground ml-2">
                    ({expenseCount} {t('import.expenseLabel')} + {incomeCount} {t('import.incomeLabel')})
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onClearExpenses}
            >
              {t('import.clearAll')}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={onNext}>
          <ArrowRight className="w-4 h-4" />
          {t('import.continue')}
        </Button>
      </div>
    </div>
  );
}
