import React, { useState, useEffect } from "react";
import { Transaction, TransactionType, TransactionCategory, PaymentStatus, RecurrenceType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types";
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
  ChevronDown,
  Calendar,
  Edit2
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
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

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
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

interface CombinedCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
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
}: TransactionCardProps) {
  const { updateTransactionStatus } = useTransactions();
  const { user } = useAuth();
  const isExpense = transaction.type === 'expense';
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchCategories();
    }
  }, [user?.id]);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro ao carregar categorias', {
        description: 'Não foi possível carregar suas categorias'
      });
    }
  }

  const handleStatusChange = async (status: PaymentStatus) => {
    try {
      await updateTransactionStatus(transaction.id, status);
      toast.success('Status atualizado com sucesso!', {
        description: `Transação marcada como ${status === 'paid' ? 'paga' : status === 'pending' ? 'pendente' : 'agendada'}`
      });
    } catch (error) {
      toast.error('Erro ao atualizar status', {
        description: 'Não foi possível atualizar o status da transação'
      });
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(transaction.id);
      toast.success('Transação removida com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover transação');
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para parsear data local corretamente
  function parseLocalDate(dateString: string) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Função para formatar a data no fuso horário correto
  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  // Encontrar a categoria atual (compatível com todos os formatos)
  const currentCategory = React.useMemo(() => {
    // 1. Categoria personalizada pelo ID
    const customCategory = categories.find(cat => cat.id === transaction.category_id);
    if (customCategory) return customCategory;

    // 2. Categoria padrão pelo nome (tenta todos os campos possíveis)
    const nome = transaction.category_name || transaction.category_id || (transaction as any).category;
    if (INCOME_CATEGORIES.includes(nome as any)) {
      return { id: nome, name: nome, type: 'income' as const };
    }
    if (EXPENSE_CATEGORIES.includes(nome as any)) {
      return { id: nome, name: nome, type: 'expense' as const };
    }

    // 3. Fallback: mostra o que tiver
    return { id: nome, name: nome || 'Sem categoria', type: transaction.type };
  }, [categories, transaction]);

  // Combinar categorias personalizadas com as padrão
  const allCategories = React.useMemo(() => {
    const defaultCategories: CombinedCategory[] = transaction.type === 'income' 
      ? INCOME_CATEGORIES.map(cat => ({ id: cat, name: cat, type: 'income' as const }))
      : EXPENSE_CATEGORIES.map(cat => ({ id: cat, name: cat, type: 'expense' as const }));
    
    const customCategories = categories.filter(cat => cat.type === transaction.type);
    
    // Remover duplicatas (caso uma categoria personalizada tenha o mesmo nome de uma padrão)
    const uniqueCategories = [...defaultCategories];
    customCategories.forEach(customCat => {
      if (!uniqueCategories.some(defCat => defCat.name === customCat.name)) {
        uniqueCategories.push(customCat);
      }
    });
    
    return uniqueCategories.sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, transaction.type]);

  return (
    <Card
      className={cn(
        "transition-all duration-300",
        isHovered && "shadow-lg",
        editingId === transaction.id && "ring-2 ring-black"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        {editingId === transaction.id ? (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              onSave(transaction.id);
            }}
            className="space-y-4"
          >
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
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-sm">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm">Data</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={editForm.date || transaction.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full py-2"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {transaction.type === 'expense' && (
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm">Data de Vencimento</Label>
                  <div className="relative">
                    <Input
                      id="dueDate"
                      type="date"
                      value={editForm.dueDate || transaction.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      className="w-full py-2"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">Descrição</Label>
              <Input
                id="description"
                value={editForm.description || transaction.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Adicione uma descrição (opcional)"
                className="w-full py-2"
              />
            </div>

            {transaction.type === 'expense' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus" className="text-sm">Status do Pagamento</Label>
                  <Select
                    value={editForm.paymentStatus || transaction.paymentStatus}
                    onValueChange={(value) => setEditForm({ ...editForm, paymentStatus: value as PaymentStatus })}
                  >
                    <SelectTrigger className="py-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrence" className="text-sm">Recorrência</Label>
                  <Select
                    value={editForm.recurrence || transaction.recurrence}
                    onValueChange={(value) => setEditForm({ ...editForm, recurrence: value as RecurrenceType })}
                  >
                    <SelectTrigger className="py-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="daily">Diária</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="flex items-center gap-2"
              >
                <XIcon className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
              >
                <Check className="h-4 w-4" />
                Salvar
              </Button>
            </div>
          </motion.form>
        ) : (
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <motion.div 
                className={cn(
                  "p-2 rounded-full",
                  transaction.type === 'expense' ? 'bg-red-100' : 'bg-green-100'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {transaction.type === 'expense' ? (
                  <ArrowDownCircle className={cn(
                    "h-5 w-5",
                    transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'
                  )} />
                ) : (
                  <ArrowUpCircle className="h-5 w-5 text-green-500" />
                )}
              </motion.div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{transaction.description}</p>
                    {transaction.recurrence && (
                      <Badge variant="outline" className="text-xs">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {transaction.recurrence}
                      </Badge>
                    )}
                  </div>
                  <p className={cn(
                    "font-semibold",
                    transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'
                  )}>
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.date)}
                  </p>
                  {transaction.type === 'expense' && transaction.dueDate && (
                    <p className="text-sm text-muted-foreground">
                      • Vence em {formatDate(transaction.dueDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {transaction.type === 'expense' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        transaction.paymentStatus === 'paid' && "text-green-500",
                        transaction.paymentStatus === 'pending' && "text-yellow-500",
                        transaction.paymentStatus === 'scheduled' && "text-blue-500"
                      )}
                    >
                      {transaction.paymentStatus === 'paid' ? (
                        <Check className="h-4 w-4" />
                      ) : transaction.paymentStatus === 'pending' ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <CalendarClock className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange('paid')}>
                      <Check className="h-4 w-4 mr-2" />
                      Pago
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                      <Clock className="h-4 w-4 mr-2" />
                      Pendente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('scheduled')}>
                      <CalendarClock className="h-4 w-4 mr-2" />
                      Agendado
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(transaction)}
                className="h-8 w-8"
              >
                <Edit2 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(transaction.id)}
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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