import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialSummary, IncomeEntry, ExpenseEntry } from '@/types/finance';

interface PDFLabels {
  getCategoryDisplayName?: (name: string) => string;
  getIncomeTypeDisplayName?: (name: string) => string;
}

export function generatePDFReport(
  summary: FinancialSummary,
  incomes: IncomeEntry[],
  expenses: ExpenseEntry[],
  month: number,
  year: number,
  language: 'en' | 'pt' = 'pt',
  labels: PDFLabels = {}
): void {
  const doc = new jsPDF();
  const catName = (c: string) => labels.getCategoryDisplayName?.(c) || c;
  const typeName = (t: string) => labels.getIncomeTypeDisplayName?.(t) || t;

  const locale = language === 'pt' ? 'pt-BR' : 'en-US';
  const currency = language === 'pt' ? 'BRL' : 'USD';
  const periodDate = new Date(year, month - 1, 1);
  const periodLabel = periodDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(20, 184, 166);
  doc.text(language === 'pt' ? 'Relatório Financeiro Mensal' : 'Monthly Finance Report', 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1), 20, 35);
  doc.text(`${language === 'pt' ? 'Gerado em' : 'Generated'}: ${new Date().toLocaleDateString(locale)}`, 20, 42);

  // Summary Section
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text(language === 'pt' ? 'Resumo Financeiro' : 'Financial Summary', 20, 60);

  const summaryData = [
    [language === 'pt' ? 'Renda Total' : 'Total Income', formatCurrency(summary.totalIncome)],
    [language === 'pt' ? 'Total de Despesas' : 'Total Expenses', formatCurrency(summary.totalExpenses)],
    [language === 'pt' ? 'Investimento Líquido' : 'Net Investment', formatCurrency(summary.totalInvestment)],
    [language === 'pt' ? '% Gasto' : 'Spent Percentage', formatPercent(summary.spentPercentage)],
    [language === 'pt' ? '% Investido' : 'Invested Percentage', formatPercent(summary.investedPercentage)],
  ];

  autoTable(doc, {
    startY: 65,
    head: [[language === 'pt' ? 'Métrica' : 'Metric', language === 'pt' ? 'Valor' : 'Value']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [20, 184, 166] },
    styles: { fontSize: 11 },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
  });

  // Income Section
  const incomeStartY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text(language === 'pt' ? 'Fontes de Renda' : 'Income Sources', 20, incomeStartY);

  // Income grouped by type (summary)
  const incomeTypeTotals = incomes.reduce<Record<string, number>>((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + i.amount;
    return acc;
  }, {});
  const incomeTypeRows = Object.entries(incomeTypeTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([type, amount]) => [
      typeName(type),
      formatCurrency(amount),
      formatPercent(summary.totalIncome > 0 ? (amount / summary.totalIncome) * 100 : 0),
    ]);

  autoTable(doc, {
    startY: incomeStartY + 5,
    head: [[language === 'pt' ? 'Tipo' : 'Type', language === 'pt' ? 'Valor' : 'Amount', language === 'pt' ? '% do Total' : '% of Total']],
    body: incomeTypeRows,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' }, 2: { halign: 'right' } },
  });

  // Expenses by Category Section
  const categoryStartY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text(language === 'pt' ? 'Despesas por Categoria' : 'Expenses by Category', 20, categoryStartY);

  const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const sortedCategories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);

  const categoryData = sortedCategories.map(cat => [
    catName(cat),
    formatCurrency(categoryTotals[cat]),
    formatPercent(summary.totalExpenses > 0 ? (categoryTotals[cat] / summary.totalExpenses) * 100 : 0),
  ]);

  autoTable(doc, {
    startY: categoryStartY + 5,
    head: [[language === 'pt' ? 'Categoria' : 'Category', language === 'pt' ? 'Valor' : 'Amount', language === 'pt' ? '% do Total' : '% of Total']],
    body: categoryData,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
    styles: { fontSize: 10 },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' },
      2: { halign: 'right' },
    },
  });

  // Details: incomes grouped by type
  const sortedIncomeTypes = Object.keys(incomeTypeTotals)
    .sort((a, b) => incomeTypeTotals[b] - incomeTypeTotals[a]);

  if (sortedIncomeTypes.length) {
    const incomeDetailY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text(language === 'pt' ? 'Detalhamento de Rendas' : 'Income Breakdown', 20, incomeDetailY);
    (doc as any).lastAutoTable.finalY = incomeDetailY;
  }

  sortedIncomeTypes.forEach(type => {
    const startY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`${typeName(type)} — ${formatCurrency(incomeTypeTotals[type])}`, 20, startY);
    autoTable(doc, {
      startY: startY + 3,
      head: [[language === 'pt' ? 'Fonte' : 'Source', language === 'pt' ? 'Valor' : 'Amount']],
      body: incomes.filter(i => i.type === type).map(i => [i.source, formatCurrency(i.amount)]),
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
      columnStyles: { 1: { halign: 'right' } },
    });
  });

  // Expense detail grouped by category
  if (sortedCategories.length) {
    const detailY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text(language === 'pt' ? 'Detalhamento de Despesas' : 'Expense Breakdown', 20, detailY);
    (doc as any).lastAutoTable.finalY = detailY;
  }

  sortedCategories.forEach(cat => {
    const startY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`${catName(cat)} — ${formatCurrency(categoryTotals[cat])}`, 20, startY);
    autoTable(doc, {
      startY: startY + 3,
      head: [[
        language === 'pt' ? 'Data' : 'Date',
        language === 'pt' ? 'Descrição' : 'Description',
        language === 'pt' ? 'Valor' : 'Amount',
      ]],
      body: expenses
        .filter(e => e.category === cat)
        .map(e => [e.date, e.description, formatCurrency(e.amount)]),
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 9 },
      columnStyles: { 2: { halign: 'right' } },
    });
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      language === 'pt' ? 'Gerado por Fechamento Mensal' : 'Generated by Monthly Closure Tool',
      20,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `${language === 'pt' ? 'Página' : 'Page'} ${i} ${language === 'pt' ? 'de' : 'of'} ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
  }

  const monthStr = String(month).padStart(2, '0');
  const fileName = language === 'pt'
    ? `relatorio-${monthStr}-${year}.pdf`
    : `report-${monthStr}-${year}.pdf`;
  doc.save(fileName);
}
