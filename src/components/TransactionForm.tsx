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

interface TransactionFormProps {
  onSubmit?: () => void;
  initialData?: Partial<Transaction>;
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
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialData?.paymentStatus || 'pending');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  
  // Campos para recorrência
  const [isRecurring, setIsRecurring] = useState(initialData?.recurrence && initialData.recurrence !== 'none');
  const [recurrence, setRecurrence] = useState<RecurrenceType>(initialData?.recurrence || 'none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(initialData?.recurrenceEndDate || '');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    // Validações
    if (!amount || isNaN(parseFloat(amount))) {
      addNotification({
        title: 'Campo obrigatório',
        message: 'Por favor, informe um valor válido',
        type: 'error'
      });
      return;
    }

    if (!category) {
      addNotification({
        title: 'Campo obrigatório',
        message: 'Por favor, selecione uma categoria',
        type: 'error'
      });
      return;
    }

    if (!date) {
      addNotification({
        title: 'Campo obrigatório',
        message: 'Por favor, informe a data',
        type: 'error'
      });
      return;
    }

    if (type === 'expense' && paymentStatus === 'scheduled' && !dueDate) {
      addNotification({
        title: 'Campo obrigatório',
        message: 'Por favor, informe a data de vencimento para pagamentos agendados',
        type: 'error'
      });
      return;
    }

    if (isRecurring && recurrence === 'none') {
      addNotification({
        title: 'Campo obrigatório',
        message: 'Por favor, selecione a frequência da recorrência',
        type: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const transaction: Omit<Transaction, "id"> = {
        type,
        amount: parseFloat(amount),
        category: category as TransactionCategory,
        date,
        description: description || undefined,
      };
      
      // Adicionar campos específicos para despesas
      if (type === 'expense') {
        transaction.paymentStatus = paymentStatus;
        if (dueDate) transaction.dueDate = dueDate;
      }
      
      // Adicionar campos de recorrência se aplicável
      if (isRecurring && recurrence !== 'none') {
        transaction.recurrence = recurrence;
        if (recurrenceEndDate) transaction.recurrenceEndDate = recurrenceEndDate;
      }
      
      await addTransaction(transaction);
      
      addNotification({
        title: 'Sucesso',
        message: `${type === 'income' ? 'Receita' : 'Despesa'} registrada com sucesso!`,
        type: 'success'
      });
      
      if (onSubmit) onSubmit();
      
      // Limpar o formulário
      setAmount('');
      setCategory('');
      setDescription('');
      setDueDate('');
      setRecurrence('none');
      setRecurrenceEndDate('');
      setIsRecurring(false);
      
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      addNotification({
        title: 'Erro',
        message: 'Ocorreu um erro ao registrar a transação. Tente novamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Tipo</Label>
          <div className="flex mt-1 space-x-2">
            <LoadingButton
              type="button"
              variant={type === 'expense' ? "default" : "outline"}
              className={cn(
                "flex-1 flex items-center justify-center gap-2",
                type === 'expense' ? "bg-red-500 hover:bg-red-600" : ""
              )}
              onClick={() => setType('expense')}
              loading={loading}
            >
              <ArrowDownCircle className="h-4 w-4" />
              Despesa
            </LoadingButton>
            <LoadingButton
              type="button"
              variant={type === 'income' ? "default" : "outline"}
              className={cn(
                "flex-1 flex items-center justify-center gap-2",
                type === 'income' ? "bg-green-500 hover:bg-green-600" : ""
              )}
              onClick={() => setType('income')}
              loading={loading}
            >
              <ArrowUpCircle className="h-4 w-4" />
              Receita
            </LoadingButton>
          </div>
        </div>
        
        <div>
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="mt-1"
            disabled={loading}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="category">Categoria</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as TransactionCategory)}
          required
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Data</Label>
          <div className="relative">
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1"
              disabled={loading}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
        
        {type === 'expense' && (
          <div>
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <div className="relative">
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1"
                disabled={loading}
              />
              <CalendarClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        )}
      </div>
      
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Descrição opcional"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
          disabled={loading}
        />
      </div>
      
      {type === 'expense' && (
        <div>
          <Label>Status de Pagamento</Label>
          <Select
            value={paymentStatus}
            onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Seção de Recorrência */}
      <div className="space-y-2 pt-2 border-t">
        <div className="flex items-center justify-between">
          <Label htmlFor="isRecurring" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Transação Recorrente
          </Label>
          <Switch
            id="isRecurring"
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
            disabled={loading}
          />
        </div>
        
        {isRecurring && (
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="recurrence">Frequência</Label>
              <Select
                value={recurrence}
                onValueChange={(value) => setRecurrence(value as RecurrenceType)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diária</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="recurrenceEndDate">Data Final (opcional)</Label>
              <div className="relative">
                <Input
                  id="recurrenceEndDate"
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  className="mt-1"
                  disabled={loading}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <LoadingButton
        type="submit"
        loading={loading}
        loadingText={`Registrando ${type === 'income' ? 'receita' : 'despesa'}...`}
        className="w-full"
      >
        {`Registrar ${type === 'income' ? 'Receita' : 'Despesa'}`}
      </LoadingButton>
    </form>
  );
}
