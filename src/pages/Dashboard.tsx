import React from "react";
import { useTransactions } from "@/context/TransactionContext";
import { FinancialSummary } from "@/components/FinancialSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { ArrowDown, ArrowUp, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { summary, transactions } = useTransactions();

  // Calcular variação percentual
  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Obter transações do mês anterior
  const getPreviousMonthTransactions = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= firstDayOfMonth && transactionDate <= lastDayOfPreviousMonth;
    });
  };

  const previousMonthTransactions = getPreviousMonthTransactions();
  const previousMonthIncome = previousMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const previousMonthExpense = previousMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeVariation = calculateVariation(summary.totalIncome, previousMonthIncome);
  const expenseVariation = calculateVariation(summary.totalExpense, previousMonthExpense);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas finanças
        </p>
      </div>

      <FinancialSummary />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <ArrowUp className="h-4 w-4 text-income" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">
              {formatCurrency(summary.totalIncome)}
            </div>
            <div className={cn(
              "flex items-center text-xs",
              incomeVariation >= 0 ? "text-income" : "text-expense"
            )}>
              {incomeVariation >= 0 ? (
                <TrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4" />
              )}
              {Math.abs(incomeVariation).toFixed(1)}% em relação ao mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <ArrowDown className="h-4 w-4 text-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">
              {formatCurrency(summary.totalExpense)}
            </div>
            <div className={cn(
              "flex items-center text-xs",
              expenseVariation <= 0 ? "text-income" : "text-expense"
            )}>
              {expenseVariation <= 0 ? (
                <TrendingDown className="mr-1 h-4 w-4" />
              ) : (
                <TrendingUp className="mr-1 h-4 w-4" />
              )}
              {Math.abs(expenseVariation).toFixed(1)}% em relação ao mês anterior
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 