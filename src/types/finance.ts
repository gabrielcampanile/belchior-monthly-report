export type IncomeType = 'Salary' | 'Freelance' | 'Other';

export interface IncomeEntry {
  id: string;
  date?: string;
  source: string;
  type: IncomeType;
  amount: number;
}

export type ExpenseCategory = 
  | 'Food'
  | 'Transportation'
  | 'Housing'
  | 'Personal purchases'
  | 'Leisure'
  | 'Health'
  | 'Subscriptions'
  | 'Electronics / Durable goods'
  | 'Other';

export interface ExpenseEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  totalInvestment: number;
  spentPercentage: number;
  investedPercentage: number;
  expensesByCategory: Record<ExpenseCategory, number>;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Housing',
  'Personal purchases',
  'Leisure',
  'Health',
  'Subscriptions',
  'Electronics / Durable goods',
  'Other',
];

export const INCOME_TYPES: IncomeType[] = ['Salary', 'Freelance', 'Other'];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'Food': '#22c55e',
  'Transportation': '#3b82f6',
  'Housing': '#f59e0b',
  'Personal purchases': '#ec4899',
  'Leisure': '#8b5cf6',
  'Health': '#ef4444',
  'Subscriptions': '#06b6d4',
  'Electronics / Durable goods': '#f97316',
  'Other': '#6b7280',
};
