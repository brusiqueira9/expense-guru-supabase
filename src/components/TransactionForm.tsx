import React, { useState } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { TransactionType, TransactionCategory, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function TransactionForm() {
  const { addTransaction } = useTransactions();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory | "">("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !date) {
      return;
    }
    
    // Garantir que a data seja mantida como está, sem conversão de timezone
    const selectedDate = new Date(date);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    
    addTransaction({
      type,
      amount: parseFloat(amount),
      category: category as TransactionCategory,
      date: formattedDate,
      description: description.trim() || undefined,
    });
    
    // Reset form
    setAmount("");
    setDescription("");
    // Keep the same type and date for convenience
  };

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <Label htmlFor="transaction-type">Tipo de Transação</Label>
        <RadioGroup 
          id="transaction-type" 
          className="flex gap-4" 
          value={type} 
          onValueChange={(val) => {
            setType(val as TransactionType);
            setCategory(""); // Reset category when type changes
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem 
              value="income" 
              id="income" 
              className="text-income" 
            />
            <Label 
              htmlFor="income" 
              className={cn("cursor-pointer", type === "income" ? "text-income font-medium" : "")}
            >
              Receita
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem 
              value="expense" 
              id="expense" 
              className="text-expense" 
            />
            <Label 
              htmlFor="expense" 
              className={cn("cursor-pointer", type === "expense" ? "text-expense font-medium" : "")}
            >
              Despesa
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Valor</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            R$
          </div>
          <Input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            className="pl-9"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as TransactionCategory)}
          required
        >
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
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          placeholder="Adicione detalhes sobre esta transação"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-none"
          rows={3}
        />
      </div>
      
      <Button type="submit" className="w-full group">
        <PlusCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
        Adicionar Transação
      </Button>
    </form>
  );
}
