import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, ArrowRight, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpenseEntry } from '@/types/finance';

interface CSVImportProps {
  onImport: (expenses: Omit<ExpenseEntry, 'id'>[]) => void;
  onNext: () => void;
  onBack: () => void;
  hasExpenses: boolean;
}

export function CSVImport({ onImport, onNext, onBack, hasExpenses }: CSVImportProps) {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{
    date: string;
    description: string;
    amount: string;
  }>({ date: '', description: '', amount: '' });
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const parseCSV = useCallback((text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
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
        const rawAmount = row[amountIndex].replace(/[^0-9.-]/g, '');
        const amount = Math.abs(parseFloat(rawAmount) || 0);
        
        return {
          date: row[dateIndex],
          description: row[descIndex],
          amount,
          category: 'Other' as const,
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
        <h2 className="text-2xl font-bold text-foreground mb-2">Import Expenses</h2>
        <p className="text-muted-foreground">Upload your credit card statement (CSV format)</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            CSV Upload
          </CardTitle>
          <CardDescription>
            Upload a CSV file exported from your credit card statement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          {!fileName ? (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all duration-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="mb-2 text-sm text-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">CSV files only</p>
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
                    {csvData.length} rows loaded
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
              <h4 className="font-medium text-foreground">Map CSV Columns</h4>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Date Column</Label>
                  <Select value={mapping.date} onValueChange={(v) => setMapping(m => ({ ...m, date: v }))}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description Column</Label>
                  <Select value={mapping.description} onValueChange={(v) => setMapping(m => ({ ...m, description: v }))}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount Column</Label>
                  <Select value={mapping.amount} onValueChange={(v) => setMapping(m => ({ ...m, amount: v }))}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select column" />
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
              {csvData.length > 0 && (
                <div className="pt-4">
                  <h4 className="font-medium text-foreground mb-2">Preview (first 3 rows)</h4>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary">
                        <tr>
                          {headers.map((h, i) => (
                            <th key={i} className="px-4 py-2 text-left font-medium text-muted-foreground">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 3).map((row, i) => (
                          <tr key={i} className="border-t border-border">
                            {row.map((cell, j) => (
                              <td key={j} className="px-4 py-2 text-foreground">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back to Income
        </Button>
        <div className="flex gap-3">
          {hasExpenses && (
            <Button variant="secondary" onClick={onNext}>
              Skip to Categorize
            </Button>
          )}
          <Button 
            onClick={handleImport} 
            disabled={!mapping.date || !mapping.description || !mapping.amount}
          >
            <ArrowRight className="w-4 h-4" />
            Import & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
