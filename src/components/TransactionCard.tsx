import React from "react";
import { Transaction, TransactionType, TransactionCategory, PaymentStatus, RecurrenceType } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge, BadgeProps } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Label } from "@/components/ui/label";

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
    <Card className={cn(
      "transition-all hover:shadow-md cursor-pointer",
      transaction.type === 'expense' ? 'hover:border-red-200' : 'hover:border-green-200'
    )}>
      <CardContent className="p-3 sm:p-4">
        {editingId === transaction.id ? (
          <form onSubmit={(e) => {
            e.preventDefault();
            onSave(transaction.id);
          }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.amount || transaction.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                  className="w-full py-2"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm">Categoria</Label>
                <Select
                  value={editForm.category || transaction.category}
                  onValueChange={(value) => setEditForm({ ...editForm, category: value as TransactionCategory })}
                >
                  <SelectTrigger className="py-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">Descrição</Label>
              <Input
                id="description"
                value={editForm.description || transaction.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full py-2"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="h-8"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8"
              >
                Salvar
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 min-w-0">
              <div className={cn(
                "p-2 rounded-full",
                transaction.type === 'expense' ? 'bg-red-100' : 'bg-green-100'
              )}>
                {transaction.type === 'expense' ? (
                  <ArrowDownCircle className={cn(
                    "h-5 w-5",
                    transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'
                  )} />
                ) : (
                  <ArrowUpCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm sm:text-base truncate">
                    {transaction.description || transaction.category}
                  </p>
                  {transaction.type === 'expense' && transaction.paymentStatus && (
                    <Badge variant="outline" className={cn(
                      "text-[10px] sm:text-xs px-1.5 py-0",
                      transaction.paymentStatus === 'paid' && 'bg-green-50 text-green-700 border-green-200',
                      transaction.paymentStatus === 'pending' && 'bg-yellow-50 text-yellow-700 border-yellow-200',
                      transaction.paymentStatus === 'scheduled' && 'bg-blue-50 text-blue-700 border-blue-200'
                    )}>
                      {transaction.paymentStatus === 'paid' && 'Pago'}
                      {transaction.paymentStatus === 'pending' && 'Pendente'}
                      {transaction.paymentStatus === 'scheduled' && 'Agendado'}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {format(new Date(transaction.date), "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                  {transaction.type === 'expense' && transaction.dueDate && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      • Vence em {format(new Date(transaction.dueDate), "dd/MM", { locale: ptBR })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <p className={cn(
                "font-semibold text-sm sm:text-base",
                transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'
              )}>
                {transaction.type === 'expense' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </p>
              
              <div className="flex items-center gap-2">
                {transaction.type === 'expense' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 sm:h-8 text-[10px] sm:text-xs text-muted-foreground hover:text-primary flex items-center gap-1 px-2"
                      >
                        <span>Status</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      sideOffset={8} 
                      className="min-w-[180px] z-[999]"
                    >
                      <DropdownMenuItem
                        onClick={() => handleStatusChange('paid')}
                        className="gap-2 py-2 cursor-pointer text-sm hover:bg-green-50"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Marcar como pago</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange('pending')}
                        className="gap-2 py-2 cursor-pointer text-sm hover:bg-yellow-50"
                      >
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span>Marcar como pendente</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange('scheduled')}
                        className="gap-2 py-2 cursor-pointer text-sm hover:bg-blue-50"
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
                  className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(transaction);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(transaction.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="sr-only">Remover</span>
                </Button>
              </div>
            </div>
          </div>
        )}
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
    <Badge className={variants[status]}>
      {icons[status]}
      {labels[status]}
    </Badge>
  );
}; 