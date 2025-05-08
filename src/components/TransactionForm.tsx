import React, { useState } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Transaction, TransactionType, TransactionCategory, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PaymentStatus, RecurrenceType } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDownCircle, ArrowUpCircle, Calendar, CalendarClock, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LoadingButton } from "@/components/ui/loading-button";
import { useNotifications } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface TransactionFormProps {
  onSubmit?: () => void;
  initialData?: Partial<Transaction>;
}

interface FormErrors {
  amount?: string;
  category?: string;
  date?: string;
  dueDate?: string;
}

export function TransactionForm({ onSubmit, initialData }: TransactionFormProps) {
  const { addTransaction } = useTransactions();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState<TransactionCategory | ''>(initialData?.category || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialData?.paymentStatus || 'pending');
  const [isRecurring, setIsRecurring] = useState(!!initialData?.recurrence);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(initialData?.recurrence || 'monthly');
  const [errors, setErrors] = useState<FormErrors>({});
  const [shake, setShake] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Valor inválido';
      isValid = false;
    }

    if (!category) {
      newErrors.category = 'Categoria é obrigatória';
      isValid = false;
    }

    if (!date) {
      newErrors.date = 'Data é obrigatória';
      isValid = false;
    }

    if (type === 'expense' && !dueDate) {
      newErrors.dueDate = 'Data de vencimento é obrigatória para despesas';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    try {
      setLoading(true);
      const transaction = {
        type,
        amount: parseFloat(amount),
        category: category as TransactionCategory,
        date,
        description,
        dueDate: type === 'expense' ? dueDate : undefined,
        paymentStatus: type === 'expense' ? paymentStatus : undefined,
        recurrence: isRecurring ? recurrenceType : undefined
      };

      await addTransaction(transaction);
      
      toast.success('Transação adicionada com sucesso!', {
        description: `${type === 'expense' ? 'Despesa' : 'Receita'} registrada`
      });

      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      toast.error('Erro ao adicionar transação', {
        description: 'Não foi possível adicionar a transação'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: keyof FormErrors) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="space-y-6"
      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={() => setType('expense')}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
              type === 'expense' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowDownCircle className="h-4 w-4" />
            Despesa
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setType('income')}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
              type === 'income' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUpCircle className="h-4 w-4" />
            Receita
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                clearError('amount');
              }}
              className={cn(
                "w-full",
                errors.amount && "border-red-500 focus:border-red-500"
              )}
              placeholder="0,00"
            />
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={category}
            onValueChange={(value) => {
              setCategory(value as TransactionCategory);
              clearError('category');
            }}
          >
            <SelectTrigger 
              id="category"
              className={cn(
                errors.category && "border-red-500 focus:border-red-500"
              )}
            >
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500 mt-1">{errors.category}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <div className="relative">
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                clearError('date');
              }}
              className={cn(
                "w-full",
                errors.date && "border-red-500 focus:border-red-500"
              )}
            />
            {errors.date && (
              <p className="text-sm text-red-500 mt-1">{errors.date}</p>
            )}
          </div>
        </div>

        {type === 'expense' && (
          <div className="space-y-2">
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <div className="relative">
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  clearError('dueDate');
                }}
                className={cn(
                  "w-full",
                  errors.dueDate && "border-red-500 focus:border-red-500"
                )}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500 mt-1">{errors.dueDate}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Adicione uma descrição (opcional)"
          className="resize-none"
        />
      </div>

      {type === 'expense' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="paymentStatus">Status do Pagamento</Label>
            <Select
              value={paymentStatus}
              onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
            >
              <SelectTrigger id="paymentStatus" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="recurring">Transação Recorrente</Label>
            <Switch
              id="recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>

          {isRecurring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="recurrenceType">Tipo de Recorrência</Label>
              <Select
                value={recurrenceType}
                onValueChange={(value) => setRecurrenceType(value as RecurrenceType)}
              >
                <SelectTrigger id="recurrenceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diária</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <LoadingButton
          type="submit"
          loading={loading}
          loadingText="Salvando..."
          className="bg-black text-white hover:bg-gray-800"
        >
          Salvar
        </LoadingButton>
      </div>
    </motion.form>
  );
}
