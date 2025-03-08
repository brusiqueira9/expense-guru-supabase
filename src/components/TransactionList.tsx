import React, { useState } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { TransactionFilters, Transaction, TransactionType, TransactionCategory, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, ArrowDownCircle, ArrowUpCircle, Filter, X, Pencil, Check, X as XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function TransactionList() {
  const { 
    filteredTransactions, 
    deleteTransaction, 
    updateTransaction,
    filters, 
    updateFilters, 
    clearFilters 
  } = useTransactions();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});

  const handleFilterChange = (key: keyof TransactionFilters, value: string | undefined) => {
    updateFilters({ [key]: value });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm(transaction);
  };

  const handleSave = () => {
    if (!editingId || !editForm.type || !editForm.amount || !editForm.category || !editForm.date) {
      return;
    }

    updateTransaction(editingId, {
      type: editForm.type,
      amount: editForm.amount,
      category: editForm.category,
      date: editForm.date,
      description: editForm.description,
    });

    setEditingId(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  const categories = editForm.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Transações</h2>
        
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange("type", value || undefined)}
          >
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value || undefined)}
          >
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder="Todas categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={clearFilters}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Filter className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-medium">Nenhuma transação encontrada</h3>
          <p className="text-muted-foreground mt-1">
            {hasActiveFilters 
              ? "Tente ajustar os filtros para ver mais resultados."
              : "Adicione uma transação para começar a controlar suas finanças."}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-4"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {(() => {
            const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
            const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

            return (
              <>
                {incomeTransactions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-1 bg-income rounded-full" />
                      <h3 className="text-lg font-medium text-income">Receitas</h3>
                    </div>
                    {incomeTransactions.map((transaction, index) => (
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
                        categories={INCOME_CATEGORIES}
                      />
                    ))}
                  </div>
                )}

                {expenseTransactions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-1 bg-expense rounded-full" />
                      <h3 className="text-lg font-medium text-expense">Despesas</h3>
                    </div>
                    {expenseTransactions.map((transaction, index) => (
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
                        categories={EXPENSE_CATEGORIES}
                      />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

interface TransactionCardProps {
  transaction: Transaction;
  index: number;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  editingId: string | null;
  editForm: Partial<Transaction>;
  setEditForm: (form: Partial<Transaction>) => void;
  onSave: () => void;
  onCancel: () => void;
  categories: TransactionCategory[];
}

function TransactionCard({
  transaction,
  index,
  onEdit,
  onDelete,
  editingId,
  editForm,
  setEditForm,
  onSave,
  onCancel,
  categories
}: TransactionCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300", 
        "hover:shadow-md",
        "animate-in",
      )}
      style={{ "--index": index } as React.CSSProperties}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div 
            className={cn(
              "w-2",
              transaction.type === "income" ? "bg-income" : "bg-expense"
            )}
          />
          <div className="flex flex-1 items-center justify-between p-4">
            {editingId === transaction.id ? (
              <div className="flex-1 space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={editForm.amount || ""}
                      onChange={(e) => setEditForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                      className="w-full"
                      placeholder="Valor"
                    />
                  </div>
                  <Select
                    value={editForm.category}
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value as TransactionCategory }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={editForm.date || ""}
                    onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                    className="flex-1"
                  />
                  <Input
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="flex-1"
                    placeholder="Descrição"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                  >
                    <XIcon className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={onSave}
                    disabled={!editForm.amount || !editForm.category || !editForm.date}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  {transaction.type === "income" ? (
                    <ArrowUpCircle className="h-5 w-5 text-income shrink-0" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-expense shrink-0" />
                  )}
                  <div className="font-medium">
                    {transaction.description || (transaction.type === "income" ? "Receita" : "Despesa")}
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {transaction.category}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4">
                  <div 
                    className={cn(
                      "font-semibold",
                      transaction.type === "income" ? "text-income" : "text-expense"
                    )}
                  >
                    {transaction.type === "expense" ? "- " : "+ "}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(transaction.date)}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-muted-foreground hover:text-primary"
                      onClick={() => onEdit(transaction)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
