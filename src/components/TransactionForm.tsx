import React from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Transaction, TransactionType, TransactionCategory, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PaymentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface TransactionFormProps {
  onSubmit?: () => void;
  initialData?: Partial<Transaction>;
}

export function TransactionForm({ onSubmit, initialData }: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useTransactions();
  const [type, setType] = React.useState<TransactionType>(initialData?.type || "expense");
  const [amount, setAmount] = React.useState(initialData?.amount?.toString() || "");
  const [category, setCategory] = React.useState<TransactionCategory | "">(initialData?.category || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [date, setDate] = React.useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = React.useState(initialData?.dueDate || "");
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus>(
    initialData?.paymentStatus || "pending"
  );

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !date) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const transaction = {
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
      dueDate: type === "expense" ? dueDate : undefined,
      paymentStatus: type === "expense" ? paymentStatus : undefined,
    };

    if (initialData?.id) {
      updateTransaction(initialData.id, transaction);
    } else {
      addTransaction(transaction);
    }

    if (onSubmit) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant={type === "expense" ? "default" : "outline"}
          className="w-full"
          onClick={() => setType("expense")}
        >
          <ArrowDownCircle className="w-4 h-4 mr-2" />
          Despesa
        </Button>
        <Button
          type="button"
          variant={type === "income" ? "default" : "outline"}
          className="w-full"
          onClick={() => setType("income")}
        >
          <ArrowUpCircle className="w-4 h-4 mr-2" />
          Receita
        </Button>
      </div>

      <div className="space-y-2">
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select value={category} onValueChange={(value: TransactionCategory) => setCategory(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
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

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          placeholder="Digite uma descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {type === "expense" && (
          <div className="space-y-2">
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        )}
      </div>

      {type === "expense" && (
        <div className="space-y-2">
          <Label htmlFor="paymentStatus">Status do Pagamento</Label>
          <Select value={paymentStatus} onValueChange={(value: PaymentStatus) => setPaymentStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" className="w-full">
        {initialData ? "Atualizar" : "Adicionar"} Transação
      </Button>
    </form>
  );
}
