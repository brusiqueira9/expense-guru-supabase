import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Transaction, TransactionType, TransactionCategory, FinancialSummary, TransactionFilters, PaymentStatus } from "@/types";
import { loadTransactions, saveTransactions } from "@/lib/storage";
import { toast } from "sonner";

interface TransactionContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  summary: FinancialSummary;
  dashboardSummary: FinancialSummary;
  filters: TransactionFilters;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => void;
  updateTransactionStatus: (id: string, paymentStatus: PaymentStatus) => void;
  updateFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const calculateSummary = (transactions: Transaction[]): FinancialSummary => {
  const incomeTotal = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenseTotal = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingExpenseTotal = transactions
    .filter(t => t.type === 'expense' && t.paymentStatus === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const paidExpenseTotal = transactions
    .filter(t => t.type === 'expense' && t.paymentStatus === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);
    
  return {
    totalIncome: incomeTotal,
    totalExpense: expenseTotal,
    balance: incomeTotal - expenseTotal,
    totalPendingExpense: pendingExpenseTotal,
    totalPaidExpense: paidExpenseTotal,
  };
};

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalPendingExpense: 0,
    totalPaidExpense: 0,
  });
  const [dashboardSummary, setDashboardSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalPendingExpense: 0,
    totalPaidExpense: 0,
  });

  // Load transactions from localStorage on initial render
  useEffect(() => {
    const loadedTransactions = loadTransactions();
    setTransactions(loadedTransactions);
  }, []);

  // Calculate dashboard summary (always uses all transactions)
  useEffect(() => {
    setDashboardSummary(calculateSummary(transactions));
  }, [transactions]);

  // Apply filters and calculate filtered summary
  useEffect(() => {
    // Apply filters
    let filtered = [...transactions];
    
    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    
    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate!));
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate!));
    }
    
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(t => t.amount >= filters.minAmount!);
    }

    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(t => t.amount <= filters.maxAmount!);
    }

    if (filters.paymentStatus && filters.paymentStatus !== "all") {
      filtered = filtered.filter(t => t.paymentStatus === filters.paymentStatus);
    }
    
    // Ordenar transações: primeiro por tipo (receitas primeiro, depois despesas) e depois por data
    filtered.sort((a, b) => {
      // Primeiro ordena por tipo (receitas primeiro)
      if (a.type !== b.type) {
        return a.type === 'income' ? -1 : 1;
      }
      // Se for do mesmo tipo, ordena por data (mais recente primeiro)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    setFilteredTransactions(filtered);
    setSummary(calculateSummary(filtered));
  }, [transactions, filters]);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: transaction.date,
      paymentStatus: transaction.type === 'expense' ? (transaction.paymentStatus || 'pending') : undefined,
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    toast.success("Transação adicionada com sucesso!");
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success("Transação removida com sucesso!");
  };

  const updateTransaction = (id: string, transaction: Omit<Transaction, "id">) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...transaction, id, date: transaction.date } : t
    ));
    toast.success("Transação atualizada com sucesso!");
  };

  const updateTransactionStatus = (id: string, paymentStatus: PaymentStatus) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, paymentStatus } : t
    ));
    toast.success("Status de pagamento atualizado com sucesso!");
  };

  const updateFilters = (newFilters: TransactionFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        filteredTransactions,
        summary,
        dashboardSummary,
        filters,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        updateTransactionStatus,
        updateFilters,
        clearFilters,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
