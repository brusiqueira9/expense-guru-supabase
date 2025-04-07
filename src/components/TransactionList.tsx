import React, { useState, useEffect } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarRange, X, AlertCircle } from "lucide-react";
import { Transaction, TransactionFilters, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TransactionCard } from "@/components/TransactionCard";
import { Button } from "@/components/ui/button";
import { formatDateWithWeekday } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";

interface TransactionListProps {
  filter?: Partial<TransactionFilters> & {
    upcomingOnly?: boolean;
    recentOnly?: boolean;
  };
  emptyMessage?: string;
}

export function TransactionList({ 
  filter = {}, 
  emptyMessage = "Nenhuma transação encontrada" 
}: TransactionListProps) {
  const { 
    filteredTransactions, 
    updateTransaction, 
    deleteTransaction, 
    filters,
    clearFilters,
    currentMonthDisplay,
    updateFilters
  } = useTransactions();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [loading, setLoading] = useState(false);
  const [displayTransactions, setDisplayTransactions] = useState<Transaction[]>([]);

  // Aplicar filtros adicionais com base nos props
  useEffect(() => {
    // Iniciar com as transações já filtradas pelo contexto global
    let transactions = [...filteredTransactions];

    // Aplicar filtros específicos desta instância
    if (filter.type) {
      transactions = transactions.filter(t => t.type === filter.type);
    }

    if (filter.paymentStatus) {
      transactions = transactions.filter(t => t.paymentStatus === filter.paymentStatus);
    }

    if (filter.category) {
      transactions = transactions.filter(t => t.category === filter.category);
    }

    // Filtro especial para transações próximas (vencendo em breve)
    if (filter.upcomingOnly) {
      const today = new Date();
      const twoWeeksLater = new Date();
      twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

      transactions = transactions.filter(t => {
        // Considerar apenas despesas não pagas
        if (t.type !== 'expense' || t.paymentStatus === 'paid') return false;
        
        // Usar data de vencimento se disponível, senão usar data normal
        const date = t.dueDate ? new Date(t.dueDate) : new Date(t.date);
        
        // Incluir se estiver entre hoje e duas semanas à frente
        return date >= today && date <= twoWeeksLater;
      });

      // Ordenar por data de vencimento (mais próximas primeiro)
      transactions.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date(a.date);
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    }

    // Filtro especial para transações recentes (últimos 7 dias)
    if (filter.recentOnly) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      transactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= oneWeekAgo;
      });

      // Ordenar por data (mais recentes primeiro)
      transactions.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }

    setDisplayTransactions(transactions);
  }, [filteredTransactions, filter]);
  
  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      description: transaction.description,
      paymentStatus: transaction.paymentStatus,
      dueDate: transaction.dueDate,
      recurrence: transaction.recurrence,
      recurrenceEndDate: transaction.recurrenceEndDate,
    });
  };
  
  const handleSave = async (id: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      await updateTransaction(id, editForm as Omit<Transaction, "id">);
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error("Erro ao atualizar transação:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  // Agrupar transações por data
  const transactionsByDate = React.useMemo(() => {
    const grouped = new Map<string, Transaction[]>();
    
    displayTransactions.forEach(transaction => {
      const date = transaction.date;
      
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      
      grouped.get(date)!.push(transaction);
    });
    
    // Converter para array e ordenar por data (mais recente primeiro)
    return Array.from(grouped.entries())
      // Ordenar por data (do mais recente para o mais antigo)
      .sort((a, b) => {
        // Simples comparação de strings ISO (YYYY-MM-DD)
        // Como todas as datas estão no mesmo formato, isso funciona para ordenação
        return b[0].localeCompare(a[0]);
      })
      .map(([date, transactions]) => ({
        date,
        // Usar a nova função de formatação que não é afetada por fuso horário
        formattedDate: formatDateWithWeekday(date),
        transactions
      }));
  }, [displayTransactions]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {filter.upcomingOnly && "Próximas Transações"}
            {filter.recentOnly && "Transações Recentes"}
            {filter.paymentStatus === 'pending' && "Transações Pendentes"}
            {!filter.upcomingOnly && !filter.recentOnly && !filter.paymentStatus && "Transações"}
          </h2>
          {filter.upcomingOnly && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Próximas 2 semanas</Badge>
          )}
          {filter.recentOnly && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Últimos 7 dias</Badge>
          )}
        </div>
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {displayTransactions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">Nenhuma transação encontrada</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {emptyMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          <p className="text-muted-foreground mb-4">
            Exibindo {displayTransactions.length} transações {currentMonthDisplay && `em ${currentMonthDisplay}`}
          </p>
          
          <AnimatePresence>
            {transactionsByDate.map(group => (
              <motion.div 
                key={group.date} 
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-3 py-1 rounded-md bg-muted/30 w-fit">
                    {group.formattedDate}
                  </h3>
                </div>
                
                <div className="space-y-3 mt-2">
                  {group.transactions
                    .sort((a, b) => {
                      // Para transações pendentes, mostrar primeiro as que têm data de vencimento próxima
                      if (filter.paymentStatus === 'pending' && a.dueDate && b.dueDate) {
                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                      }
                      
                      // Ordenar por tipo (receitas primeiro, depois despesas)
                      if (a.type !== b.type) {
                        return a.type === 'income' ? -1 : 1;
                      }
                      // Se for do mesmo tipo, ordenar por valor (maior primeiro)
                      return b.amount - a.amount;
                    })
                    .map((transaction, index) => (
                      <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        index={index}
                        onEdit={handleEdit}
                        onDelete={deleteTransaction}
                        editingId={editingId}
                        editForm={editForm}
                        setEditForm={setEditForm}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        categories={transaction.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES}
                      />
                    ))
                  }
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}