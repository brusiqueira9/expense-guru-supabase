
import React from "react";
import { useTransactions } from "@/context/TransactionContext";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function FinancialSummary() {
  const { summary } = useTransactions();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Receitas</p>
              <p className="text-2xl font-bold text-income">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-income/10 flex items-center justify-center">
              <ArrowUp className="h-6 w-6 text-income" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Despesas</p>
              <p className="text-2xl font-bold text-expense">
                {formatCurrency(summary.totalExpense)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-expense/10 flex items-center justify-center">
              <ArrowDown className="h-6 w-6 text-expense" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        summary.balance < 0 ? "border-expense/50" : "border-income/50"
      )}>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Saldo</p>
              <p className={cn(
                "text-2xl font-bold",
                summary.balance < 0 ? "text-expense" : "text-income"
              )}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center",
              summary.balance < 0 ? "bg-expense/10" : "bg-income/10"
            )}>
              <Wallet className={cn(
                "h-6 w-6",
                summary.balance < 0 ? "text-expense" : "text-income"
              )} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
