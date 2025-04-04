import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Transaction, TransactionType, TransactionCategory, FinancialSummary, TransactionFilters, PaymentStatus, RecurrenceType } from "@/types";
import { loadTransactions, saveTransactions, clearTransactions, migrateOldData } from "@/lib/storage";
import { transactionService } from "@/lib/supabaseServices";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format, parse, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  summary: FinancialSummary;
  dashboardSummary: FinancialSummary;
  filters: TransactionFilters;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => void;
  updateTransactionStatus: (id: string, paymentStatus: PaymentStatus) => void;
  updateFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  setMonthFilter: (date: Date) => void;
  currentMonthDisplay: string;
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
    
  const scheduledExpenseTotal = transactions
    .filter(t => t.type === 'expense' && t.paymentStatus === 'scheduled')
    .reduce((sum, t) => sum + t.amount, 0);
    
  return {
    totalIncome: incomeTotal,
    totalExpense: expenseTotal,
    balance: incomeTotal - expenseTotal,
    totalPendingExpense: pendingExpenseTotal,
    totalPaidExpense: paidExpenseTotal,
    totalScheduledExpense: scheduledExpenseTotal,
  };
};

// Função para gerar datas futuras com base na recorrência
const generateFutureDate = (baseDate: string, recurrence: RecurrenceType, occurrenceNumber: number): string => {
  const date = new Date(baseDate);
  
  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + occurrenceNumber);
      break;
    case 'weekly':
      date.setDate(date.getDate() + (occurrenceNumber * 7));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + occurrenceNumber);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + occurrenceNumber);
      break;
    default:
      return baseDate;
  }
  
  return date.toISOString().split('T')[0];
};

// Função para gerar transações recorrentes
const generateRecurringTransactions = (
  baseTransaction: Omit<Transaction, "id">, 
  recurrence: RecurrenceType,
  recurrenceEndDate?: string,
  parentId?: string
): Omit<Transaction, "id">[] => {
  const transactions: Omit<Transaction, "id">[] = [];
  
  // Se não houver recorrência ou for 'none', retornar array vazio
  if (!recurrence || recurrence === 'none') {
    return transactions;
  }
  
  // Determinar o número de ocorrências a gerar
  let occurrences = 6; // Padrão: gerar 6 ocorrências futuras
  
  // Se houver data final, calcular o número de ocorrências até essa data
  if (recurrenceEndDate) {
    const startDate = new Date(baseTransaction.date);
    const endDate = new Date(recurrenceEndDate);
    
    // Calcular diferença em dias
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calcular número de ocorrências com base na recorrência
    switch (recurrence) {
      case 'daily':
        occurrences = diffDays;
        break;
      case 'weekly':
        occurrences = Math.ceil(diffDays / 7);
        break;
      case 'monthly':
        // Aproximação: um mês tem cerca de 30 dias
        occurrences = Math.ceil(diffDays / 30);
        break;
      case 'yearly':
        // Aproximação: um ano tem cerca de 365 dias
        occurrences = Math.ceil(diffDays / 365);
        break;
    }
    
    // Limitar a 12 ocorrências no máximo para evitar sobrecarga
    occurrences = Math.min(occurrences, 12);
  }
  
  // Gerar transações recorrentes
  for (let i = 1; i <= occurrences; i++) {
    const newDate = generateFutureDate(baseTransaction.date, recurrence, i);
    
    // Se houver data final e a nova data ultrapassar, parar
    if (recurrenceEndDate && newDate > recurrenceEndDate) {
      break;
    }
    
    // Criar nova transação com a data calculada
    const newTransaction: Omit<Transaction, "id"> = {
      ...baseTransaction,
      date: newDate,
      parentTransactionId: parentId,
      // Remover campos de recorrência para evitar recursão infinita
      recurrence: undefined,
      recurrenceEndDate: undefined
    };
    
    // Se for despesa com data de vencimento, atualizar também
    if (baseTransaction.type === 'expense' && baseTransaction.dueDate) {
      newTransaction.dueDate = generateFutureDate(baseTransaction.dueDate, recurrence, i);
    }
    
    transactions.push(newTransaction);
  }
  
  return transactions;
};

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalPendingExpense: 0,
    totalPaidExpense: 0,
    totalScheduledExpense: 0,
  });
  const [dashboardSummary, setDashboardSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalPendingExpense: 0,
    totalPaidExpense: 0,
    totalScheduledExpense: 0,
  });
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  // Calcular string para exibição do mês atual (ex: "Junho 2023")
  const currentMonthDisplay = format(currentMonth, "MMMM yyyy", { locale: ptBR });

  // Função para definir o filtro mensal
  const setMonthFilter = (date: Date) => {
    setCurrentMonth(date);
    const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(date), 'yyyy-MM-dd');
    
    setFilters(prev => ({
      ...prev,
      startDate,
      endDate
    }));
  };

  // Função para migrar dados do localStorage para o Supabase
  const migrateLocalStorageToSupabase = async (userId: string) => {
    try {
      // Carrega as transações do localStorage
      const localTransactions = loadTransactions(userId, user?.email || '');
      
      if (localTransactions.length > 0) {
        // Migra as transações para o Supabase
        await transactionService.migrateFromLocalStorage(userId, localTransactions);
        
        // Limpa o localStorage após a migração bem-sucedida
        clearTransactions(userId);
        
        toast.success("Dados migrados para o banco de dados com sucesso!");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao migrar dados para o Supabase:", error);
      toast.error("Erro ao migrar dados para o banco de dados");
      return false;
    }
  };

  // Carregar transações e aplicar filtro mensal por padrão
  useEffect(() => {
    const fetchTransactions = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          // Tenta carregar transações do Supabase
          const supabaseTransactions = await transactionService.getAll(user.id);
          
          // Se não houver transações no Supabase, tenta migrar do localStorage
          if (supabaseTransactions.length === 0) {
            const wasMigrated = await migrateLocalStorageToSupabase(user.id);
            
            if (wasMigrated) {
              // Recarrega as transações após a migração
              const migratedTransactions = await transactionService.getAll(user.id);
              setTransactions(migratedTransactions);
              toast.success("Dados carregados com sucesso!");
            } else {
              setTransactions([]);
            }
          } else {
            setTransactions(supabaseTransactions);
            toast.success("Dados carregados com sucesso!");
          }
          
          // Aplica filtro por mês atual por padrão
          setMonthFilter(currentMonth);
          
        } catch (error) {
          console.error("Erro ao carregar transações:", error);
          toast.error("Erro ao carregar transações do banco de dados");
          setTransactions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setTransactions([]);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id]);

  // Clear transactions when user logs out
  useEffect(() => {
    if (!user?.id) {
      setTransactions([]);
      setFilters({});
      setFilteredTransactions([]);
      setSummary({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        totalPendingExpense: 0,
        totalPaidExpense: 0,
        totalScheduledExpense: 0,
      });
      setDashboardSummary({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        totalPendingExpense: 0,
        totalPaidExpense: 0,
        totalScheduledExpense: 0,
      });
    }
  }, [user?.id]);

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
    
    if (filters.recurrence && filters.recurrence !== "all") {
      filtered = filtered.filter(t => t.recurrence === filters.recurrence);
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

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      // Verificar se é uma transação recorrente
      const isRecurring = transaction.recurrence && transaction.recurrence !== 'none';
      
      // Preparar a transação base para salvar
      const baseTransaction = {
        ...transaction,
        user_id: user.id,
      };
      
      // Adicionar a transação base no Supabase
      const savedTransaction = await transactionService.add(baseTransaction);
      
      // Atualizar o estado local com a transação base
      setTransactions(prev => [savedTransaction, ...prev]);
      
      // Se for recorrente, gerar e salvar as transações futuras
      if (isRecurring) {
        // Gerar transações recorrentes
        const recurringTransactions = generateRecurringTransactions(
          baseTransaction,
          transaction.recurrence!,
          transaction.recurrenceEndDate,
          savedTransaction.id
        );
        
        // Salvar cada transação recorrente no Supabase
        for (const recTransaction of recurringTransactions) {
          const savedRecTransaction = await transactionService.add({
            ...recTransaction,
            user_id: user.id
          });
          
          // Atualizar o estado local com cada transação recorrente
          setTransactions(prev => [savedRecTransaction, ...prev]);
        }
        
        // Notificar o usuário sobre as transações recorrentes
        toast.success(`Transação adicionada com sucesso! Foram criadas ${recurringTransactions.length} transações recorrentes.`);
      } else {
        toast.success("Transação adicionada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      toast.error("Erro ao adicionar transação no banco de dados");
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      // Buscar a transação a ser excluída
      const transactionToDelete = transactions.find(t => t.id === id);
      
      if (!transactionToDelete) {
        toast.error("Transação não encontrada");
        return;
      }
      
      // Verificar se é uma transação pai (tem recorrência)
      const isParentTransaction = transactions.some(t => t.parentTransactionId === id);
      
      // Se for uma transação pai, perguntar se deseja excluir todas as recorrências
      if (isParentTransaction) {
        const confirmDelete = window.confirm(
          "Esta é uma transação recorrente. Deseja excluir todas as ocorrências futuras também?"
        );
        
        if (confirmDelete) {
          // Excluir a transação pai
          await transactionService.delete(id);
          
          // Excluir todas as transações filhas
          const childTransactions = transactions.filter(t => t.parentTransactionId === id);
          for (const childTransaction of childTransactions) {
            await transactionService.delete(childTransaction.id);
          }
          
          // Atualizar o estado local
          setTransactions(prev => prev.filter(t => t.id !== id && t.parentTransactionId !== id));
          
          toast.success("Transação e suas recorrências removidas com sucesso!");
        } else {
          // Excluir apenas a transação selecionada
          await transactionService.delete(id);
          
          // Atualizar o estado local
          setTransactions(prev => prev.filter(t => t.id !== id));
          
          toast.success("Transação removida com sucesso!");
        }
      } else if (transactionToDelete.parentTransactionId) {
        // É uma transação filha, perguntar se deseja excluir apenas esta ou todas a partir desta
        const confirmDelete = window.confirm(
          "Esta é parte de uma série recorrente. Deseja excluir todas as ocorrências futuras também?"
        );
        
        if (confirmDelete) {
          // Excluir esta transação e todas as futuras
          const transactionDate = new Date(transactionToDelete.date);
          const parentId = transactionToDelete.parentTransactionId;
          
          // Encontrar todas as transações futuras da mesma série
          const futureTransactions = transactions.filter(t => 
            t.parentTransactionId === parentId && 
            new Date(t.date) >= transactionDate
          );
          
          // Excluir cada transação futura
          for (const futureTransaction of futureTransactions) {
            await transactionService.delete(futureTransaction.id);
          }
          
          // Atualizar o estado local
          setTransactions(prev => prev.filter(t => 
            !(t.parentTransactionId === parentId && new Date(t.date) >= transactionDate)
          ));
          
          toast.success("Transação e ocorrências futuras removidas com sucesso!");
        } else {
          // Excluir apenas a transação selecionada
          await transactionService.delete(id);
          
          // Atualizar o estado local
          setTransactions(prev => prev.filter(t => t.id !== id));
          
          toast.success("Transação removida com sucesso!");
        }
      } else {
        // Transação normal (não recorrente)
        await transactionService.delete(id);
        
        // Atualizar o estado local
        setTransactions(prev => prev.filter(t => t.id !== id));
        
        toast.success("Transação removida com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      toast.error("Erro ao excluir transação do banco de dados");
    }
  };

  const updateTransaction = async (id: string, transaction: Omit<Transaction, "id">) => {
    try {
      // Buscar a transação a ser atualizada
      const transactionToUpdate = transactions.find(t => t.id === id);
      
      if (!transactionToUpdate) {
        toast.error("Transação não encontrada");
        return;
      }
      
      // Verificar se é uma transação pai ou filha
      const isParentTransaction = transactions.some(t => t.parentTransactionId === id);
      const isChildTransaction = transactionToUpdate.parentTransactionId;
      
      // Se for uma transação recorrente (pai ou filha), perguntar se deseja atualizar todas
      if (isParentTransaction || isChildTransaction) {
        const confirmUpdate = window.confirm(
          "Esta é uma transação recorrente. Deseja atualizar todas as ocorrências futuras também?"
        );
        
        if (confirmUpdate) {
          if (isParentTransaction) {
            // Atualizar a transação pai
            await transactionService.update(id, transaction);
            
            // Atualizar todas as transações filhas
            const childTransactions = transactions.filter(t => t.parentTransactionId === id);
            for (const childTransaction of childTransactions) {
              // Manter a data original da transação filha
              const childDate = childTransaction.date;
              const childDueDate = childTransaction.dueDate;
              
              await transactionService.update(childTransaction.id, {
                ...transaction,
                date: childDate,
                dueDate: childDueDate
              });
            }
            
            // Recarregar todas as transações para garantir consistência
            if (user?.id) {
              const updatedTransactions = await transactionService.getAll(user.id);
              setTransactions(updatedTransactions);
            }
            
            toast.success("Transação e suas recorrências atualizadas com sucesso!");
          } else if (isChildTransaction) {
            // É uma transação filha, atualizar esta e todas as futuras
            const transactionDate = new Date(transactionToUpdate.date);
            const parentId = transactionToUpdate.parentTransactionId;
            
            // Atualizar esta transação
            await transactionService.update(id, transaction);
            
            // Encontrar todas as transações futuras da mesma série
            const futureTransactions = transactions.filter(t => 
              t.parentTransactionId === parentId && 
              new Date(t.date) > transactionDate
            );
            
            // Atualizar cada transação futura
            for (const futureTransaction of futureTransactions) {
              // Manter a data original da transação futura
              const futureDate = futureTransaction.date;
              const futureDueDate = futureTransaction.dueDate;
              
              await transactionService.update(futureTransaction.id, {
                ...transaction,
                date: futureDate,
                dueDate: futureDueDate
              });
            }
            
            // Recarregar todas as transações para garantir consistência
            if (user?.id) {
              const updatedTransactions = await transactionService.getAll(user.id);
              setTransactions(updatedTransactions);
            }
            
            toast.success("Transação e ocorrências futuras atualizadas com sucesso!");
          }
        } else {
          // Atualizar apenas a transação selecionada
          await transactionService.update(id, transaction);
          
          // Atualizar o estado local
          setTransactions(prev => prev.map(t => 
            t.id === id ? { ...transaction, id } : t
          ));
          
          toast.success("Transação atualizada com sucesso!");
        }
      } else {
        // Transação normal (não recorrente)
        await transactionService.update(id, transaction);
        
        // Atualizar o estado local
        setTransactions(prev => prev.map(t => 
          t.id === id ? { ...transaction, id } : t
        ));
        
        toast.success("Transação atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      toast.error("Erro ao atualizar transação no banco de dados");
    }
  };

  const updateTransactionStatus = async (id: string, paymentStatus: PaymentStatus) => {
    try {
      // Atualizar o status da transação no Supabase
      await transactionService.update(id, { paymentStatus });
      
      // Atualizar o estado local
      setTransactions(prev => prev.map(t => 
        t.id === id ? { ...t, paymentStatus } : t
      ));
      toast.success("Status de pagamento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status de pagamento:", error);
      toast.error("Erro ao atualizar status de pagamento no banco de dados");
    }
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
        currentMonth,
        setCurrentMonth,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        updateTransactionStatus,
        updateFilters,
        clearFilters,
        setMonthFilter,
        currentMonthDisplay,
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
