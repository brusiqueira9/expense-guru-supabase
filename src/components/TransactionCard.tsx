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