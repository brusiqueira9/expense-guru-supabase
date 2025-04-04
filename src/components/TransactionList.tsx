import React, { useState } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarRange, X } from "lucide-react";
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TransactionCard } from "@/components/TransactionCard";
import { Button } from "@/components/ui/button";
import { formatDateWithWeekday } from "@/lib/formatters";

export function TransactionList() {
  const { 
    filteredTransactions, 
    updateTransaction, 
    deleteTransaction, 
    filters,
    clearFilters,
    currentMonthDisplay
  } = useTransactions();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [loading, setLoading] = useState(false);
  
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
    
    filteredTransactions.forEach(transaction => {
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
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Transações</h2>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="shrink-0 gap-2"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="flex flex-col items-center gap-2">
              <CalendarRange className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">Nenhuma transação encontrada</h3>
              <p className="text-muted-foreground">
                {filters.startDate || filters.endDate 
                  ? `Não há transações no período selecionado.`
                  : `Não há transações cadastradas.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          <p className="text-muted-foreground mb-4">
            Exibindo {filteredTransactions.length} transações {currentMonthDisplay && `em ${currentMonthDisplay}`}
          </p>
          
          {transactionsByDate.map(group => (
            <div key={group.date} className="mb-6">
              <div className="sticky top-0 bg-background z-10 py-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                  {group.formattedDate}
                </h3>
              </div>
              
              <div className="space-y-4">
                {group.transactions
                  .sort((a, b) => {
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 