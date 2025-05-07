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
              "w-1 sm:w-2",
              transaction.type === "income" ? "bg-green-500" : "bg-red-500"
            )}
          />
          <div className="flex-1 p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                {transaction.type === "income" ? (
                  <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
                ) : (
                  <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 shrink-0" />
                )}
                <div className={cn(
                  "font-medium",
                  "text-foreground flex-1"
                )}>
                  <h3 className="font-medium text-sm sm:text-base line-clamp-1">
                    {transaction.description || transaction.category}
                  </h3>
                  {transaction.recurrence && transaction.recurrence !== 'none' && (
                    <Badge variant="outline" className="flex items-center gap-1 text-[10px] sm:text-xs">
                      <RefreshCw className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {transaction.recurrence === 'daily' && 'Diária'}
                      {transaction.recurrence === 'weekly' && 'Semanal'}
                      {transaction.recurrence === 'monthly' && 'Mensal'}
                      {transaction.recurrence === 'yearly' && 'Anual'}
                    </Badge>
                  )}
                  {transaction.parentTransactionId && (
                    <Badge variant="outline" className="text-[10px] sm:text-xs">Recorrente</Badge>
                  )}
                </div>
                
                <Badge variant="outline" className={cn(
                  "w-fit text-[10px] sm:text-xs",
                  transaction.type === "income" ? "text-green-500" : "text-red-500"
                )}>
                  {transaction.category}
                </Badge>
                {isExpense && transaction.paymentStatus && (
                  <PaymentStatusBadge status={transaction.paymentStatus} />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className={cn(
                  "text-base sm:text-lg font-bold",
                  transaction.type === "income" ? "text-green-500" : "text-red-500"
                )}>
                  {formatCurrency(transaction.amount)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {formatDate(transaction.date)}
                </div>
              </div>
              
              <div className="flex items-center bg-muted/40 rounded-lg p-1 sm:p-1.5 pl-2 sm:pl-3">
                <div className="flex-1 text-xs sm:text-sm text-muted-foreground">
                  <span className="sm:inline">Status:</span> <span className="font-medium">{transaction.paymentStatus === 'paid' ? 'Pago' : transaction.paymentStatus === 'scheduled' ? 'Agendado' : 'Pendente'}</span>
                </div>
                <div className="flex gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 sm:h-8 rounded-md text-muted-foreground hover:text-primary flex items-center gap-1 touch-manipulation px-2 md:px-3 active:scale-95 transition-transform"
                      >
                        <span className="inline text-[10px] sm:text-xs md:text-sm">Alterar</span>
                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
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