import React, { useState } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Transaction, TransactionType, TransactionCategory, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PaymentStatus, RecurrenceType } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowDownCircle, ArrowUpCircle, Filter, X, Pencil, Check, X as XIcon, Clock, CalendarClock, MoreVertical, ArrowDownUp, Calendar, Edit, Trash, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PaymentStatusBadge = ({ status }: { status?: PaymentStatus }) => {
  if (!status) return null;

  const variants = {
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  };

  const icons = {
    paid: <Check className="w-3 h-3 mr-1" />,
    pending: <Clock className="w-3 h-3 mr-1" />,
    scheduled: <CalendarClock className="w-3 h-3 mr-1" />,
  };

  const labels = {
    paid: "Pago",
    pending: "Pendente",
    scheduled: "Agendado",
  };

  return (
    <Badge variant="secondary" className={variants[status]}>
      {icons[status]}
      {labels[status]}
    </Badge>
  );
};

export function TransactionList() {
  const { 
    filteredTransactions, 
    deleteTransaction, 
    updateTransaction,
    filters, 
    updateFilters, 
    clearFilters,
    summary,
    updateTransactionStatus
  } = useTransactions();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm(transaction);
    setSelectedTransaction(transaction);
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
      dueDate: editForm.type === 'expense' ? editForm.dueDate : undefined,
      paymentStatus: editForm.type === 'expense' ? editForm.paymentStatus : undefined,
      recurrence: editForm.recurrence || 'none',
      recurrenceEndDate: editForm.recurrenceEndDate,
      parentTransactionId: editForm.parentTransactionId
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

  const handleStatusChange = (status: PaymentStatus) => {
    if (selectedTransaction) {
      updateTransactionStatus(selectedTransaction.id, status);
    }
  };

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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-1 bg-green-500 rounded-full" />
                        <h3 className="text-lg font-medium text-green-500">Receitas</h3>
                      </div>
                      <Badge variant="secondary" className="text-green-500">
                        {incomeTransactions.length} transação(ões)
                      </Badge>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-1 bg-red-500 rounded-full" />
                        <h3 className="text-lg font-medium text-red-500">Despesas</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-red-500">
                          {expenseTransactions.length} transação(ões)
                        </Badge>
                        {filters.paymentStatus && filters.paymentStatus !== 'all' && (
                          <PaymentStatusBadge status={filters.paymentStatus as PaymentStatus} />
                        )}
                      </div>
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
  setEditForm: React.Dispatch<React.SetStateAction<Partial<Transaction>>>;
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
  const { updateTransactionStatus } = useTransactions();
  const isExpense = transaction.type === 'expense';

  const handleStatusChange = (status: PaymentStatus) => {
    updateTransactionStatus(transaction.id, status);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300", 
        "hover:shadow-md",
        "animate-in"
      )}
      style={{ "--index": index } as React.CSSProperties}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div 
            className={cn(
              "w-2",
              transaction.type === "income" ? "bg-green-500" : "bg-red-500"
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
                  {editForm.type === 'expense' && (
                    <Input
                      type="date"
                      value={editForm.dueDate || ""}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="flex-1"
                      placeholder="Data de Vencimento"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="flex-1"
                    placeholder="Descrição"
                  />
                  {editForm.type === 'expense' && (
                    <Select
                      value={editForm.paymentStatus}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, paymentStatus: value as PaymentStatus }))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="scheduled">Agendado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select
                    value={editForm.recurrence || "none"}
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, recurrence: value as RecurrenceType }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Recorrência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem recorrência</SelectItem>
                      <SelectItem value="daily">Diária</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {editForm.recurrence && editForm.recurrence !== 'none' && (
                    <Input
                      type="date"
                      value={editForm.recurrenceEndDate || ""}
                      onChange={(e) => setEditForm(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                      className="flex-1"
                      placeholder="Data Final (opcional)"
                    />
                  )}
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
                    <ArrowUpCircle className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                  <div className={cn(
                    "font-medium",
                    "text-foreground"
                  )}>
                    <h3 className="font-medium">
                      {transaction.description || transaction.category}
                    </h3>
                    {transaction.recurrence && transaction.recurrence !== 'none' && (
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <RefreshCw className="h-3 w-3" />
                        {transaction.recurrence === 'daily' && 'Diária'}
                        {transaction.recurrence === 'weekly' && 'Semanal'}
                        {transaction.recurrence === 'monthly' && 'Mensal'}
                        {transaction.recurrence === 'yearly' && 'Anual'}
                      </Badge>
                    )}
                    {transaction.parentTransactionId && (
                      <Badge variant="outline" className="text-xs">Recorrente</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      "w-fit",
                      transaction.type === "income" ? "text-green-500" : "text-red-500"
                    )}>
                      {transaction.category}
                    </Badge>
                    {isExpense && (
                      <PaymentStatusBadge status={transaction.paymentStatus} />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "text-lg font-bold",
                    transaction.type === "income" ? "text-green-500" : "text-red-500"
                  )}>
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(transaction.date)}
                  </div>
                </div>
                <div className="flex gap-1">
                  {isExpense && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-muted-foreground hover:text-primary"
                        >
                          {transaction.paymentStatus === 'paid' ? (
                            <Check className="h-4 w-4" />
                          ) : transaction.paymentStatus === 'scheduled' ? (
                            <CalendarClock className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleStatusChange('paid')}
                          className="gap-2"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Marcar como pago</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange('pending')}
                          className="gap-2"
                        >
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span>Marcar como pendente</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange('scheduled')}
                          className="gap-2"
                        >
                          <CalendarClock className="h-4 w-4 text-blue-500" />
                          <span>Marcar como agendado</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
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
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
