export type TransactionType = 'income' | 'expense';

export type PaymentStatus = 'paid' | 'pending' | 'scheduled';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

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
  category_id: string;
  category_name: string;
  date: string;
  description?: string;
  paymentStatus?: PaymentStatus;
  dueDate?: string;
  recurrence?: RecurrenceType;
  recurrenceEndDate?: string;
  parentTransactionId?: string;
  isnotificationread?: boolean;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalPendingExpense: number;
  totalPaidExpense: number;
  totalScheduledExpense: number;
}

export interface TransactionFilters {
  type?: TransactionType | 'all';
  category?: TransactionCategory | 'all';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentStatus?: PaymentStatus | 'all';
  recurrence?: RecurrenceType | 'all';
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
