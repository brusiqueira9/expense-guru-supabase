export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  | 'Salário'
  | 'Investimentos'
  | 'Freelance'
  | 'Outras Receitas'
  | 'Faturas'
  | 'Contas Fixas'
  | 'Lazer'
  | 'Educação'
  | 'Alimentação'
  | 'Transporte'
  | 'Saúde'
  | 'Outras Despesas';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  date: string;
  description?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface TransactionFilters {
  type?: TransactionType | 'all';
  category?: TransactionCategory | 'all';
  startDate?: string;
  endDate?: string;
}

export const INCOME_CATEGORIES: TransactionCategory[] = [
  'Salário',
  'Investimentos',
  'Freelance',
  'Outras Receitas'
];

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'Faturas',
  'Contas Fixas',
  'Lazer',
  'Educação',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Outras Despesas'
];
