import React from "react";
import { Transaction, TransactionType, TransactionCategory, PaymentStatus, RecurrenceType } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowDownCircle, 
  ArrowUpCircle,
  Check, 
  X as XIcon, 
  Clock, 
  CalendarClock, 
  RefreshCw,
  Pencil,
  Trash2,
  ChevronDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransactions } from "@/context/TransactionContext";

interface TransactionCardProps {
  transaction: Transaction;
  index: number;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  editingId: string | null;
  editForm: Partial<Transaction>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<Transaction>>>;
  onSave: (id: string) => void;
  onCancel: () => void;
  categories: TransactionCategory[];
}

export function TransactionCard({
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
          <div className="flex flex-1 items-start justify-between p-3 sm:p-4 flex-col sm:flex-row gap-2 sm:gap-4">
            {editingId === transaction.id ? (
              <div className="flex-1 space-y-4 w-full">
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
                    onClick={() => onSave(transaction.id)}
                    disabled={!editForm.amount || !editForm.category || !editForm.date}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    {transaction.type === "income" ? (
                      <ArrowUpCircle className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                    <div className={cn(
                      "font-medium",
                      "text-foreground flex-1"
                    )}>
                      <h3 className="font-medium line-clamp-1">
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
                    <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
                      <Badge variant="outline" className={cn(
                        "w-fit",
                        transaction.type === "income" ? "text-green-500" : "text-red-500"
                      )}>
                        {transaction.category}
                      </Badge>
                      {isExpense && transaction.paymentStatus && (
                        <PaymentStatusBadge status={transaction.paymentStatus} />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
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
                  
                  {isExpense && (
                    <div className="flex items-center bg-muted/40 rounded-lg p-1.5 pl-3">
                      <div className="flex-1 text-sm text-muted-foreground">
                        <span className="sm:inline">Status:</span> <span className="font-medium">{transaction.paymentStatus === 'paid' ? 'Pago' : transaction.paymentStatus === 'scheduled' ? 'Agendado' : 'Pendente'}</span>
                      </div>
                      <div className="flex gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-md text-muted-foreground hover:text-primary flex items-center gap-1 touch-manipulation px-2 md:px-3 active:scale-95 transition-transform"
                            >
                              <span className="inline text-xs md:text-sm">Alterar</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end" 
                            sideOffset={8} 
                            className="min-w-[180px] z-[999]"
                            avoidCollisions={true}
                            collisionPadding={16}
                            sticky="always"
                          >
                            <DropdownMenuItem
                              onClick={() => handleStatusChange('paid')}
                              className="gap-2 py-3 cursor-pointer text-sm hover:bg-green-50 dark:hover:bg-green-900/20 active:bg-green-100 dark:active:bg-green-900/40"
                            >
                              <Check className="h-4 w-4 text-green-500" />
                              <span>Marcar como pago</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange('pending')}
                              className="gap-2 py-3 cursor-pointer text-sm hover:bg-yellow-50 dark:hover:bg-yellow-900/20 active:bg-yellow-100 dark:active:bg-yellow-900/40"
                            >
                              <Clock className="h-4 w-4 text-yellow-500" />
                              <span>Marcar como pendente</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange('scheduled')}
                              className="gap-2 py-3 cursor-pointer text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/40"
                            >
                              <CalendarClock className="h-4 w-4 text-blue-500" />
                              <span>Marcar como agendado</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 sm:flex-col items-center self-end sm:self-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 active:scale-95 transition-all h-9 w-9 min-h-9 min-w-9"
                    onClick={() => onEdit(transaction)}
                    aria-label="Editar transação"
                  >
                    <Pencil className="h-[18px] w-[18px]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all h-9 w-9 min-h-9 min-w-9"
                    onClick={() => onDelete(transaction.id)}
                    aria-label="Excluir transação"
                  >
                    <Trash2 className="h-[18px] w-[18px]" />
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

// PaymentStatusBadge component to show visual status of expenses
const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
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