import React from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { ArrowUp, ArrowDown, Wallet, AlertTriangle, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FinancialSummaryProps {
  showTitle?: boolean;
}

const formatPercentage = (value: number) => {
  return `${Math.abs(value).toFixed(1)}%`;
};

export function FinancialSummary({ showTitle = true }: FinancialSummaryProps) {
  const { summary } = useTransactions();
  
  // Calcular progresso do orçamento
  const budgetProgress = React.useMemo(() => {
    if (summary.totalIncome === 0) return 0;
    const percentage = (summary.totalExpense / summary.totalIncome) * 100;
    return Math.min(percentage, 100); // Garantir que não ultrapasse 100%
  }, [summary]);
  
  // Determinar status do orçamento
  const budgetStatus = React.useMemo(() => {
    if (budgetProgress < 70) return "good";
    if (budgetProgress < 90) return "warning";
    return "danger";
  }, [budgetProgress]);
  
  // Calcular economia (quanto sobrou da receita)
  const savings = summary.totalIncome - summary.totalExpense;
  const savingsPercentage = summary.totalIncome 
    ? (savings / summary.totalIncome) * 100 
    : 0;

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {showTitle && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Resumo Financeiro</h3>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Receitas</p>
                  <h3 className="text-2xl font-bold text-green-500 mt-1">{formatCurrency(summary.totalIncome)}</h3>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <ArrowUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Despesas</p>
                  <h3 className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(summary.totalExpense)}</h3>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <ArrowDown className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${
              summary.balance >= 0 
                ? "from-blue-400 to-blue-600" 
                : "from-yellow-400 to-yellow-600"
            }`}></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <h3 className={`text-2xl font-bold mt-1 ${
                    summary.balance >= 0 ? "text-blue-500" : "text-yellow-500"
                  }`}>{formatCurrency(summary.balance)}</h3>
                </div>
                <div className={`p-2 rounded-full ${
                  summary.balance >= 0 
                    ? "bg-blue-100 dark:bg-blue-900/30" 
                    : "bg-yellow-100 dark:bg-yellow-900/30"
                }`}>
                  <Wallet className={`h-5 w-5 ${
                    summary.balance >= 0 ? "text-blue-500" : "text-yellow-500"
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Orçamento</CardTitle>
              <CardDescription>
                {summary.totalExpense > 0 && summary.totalIncome > 0 
                  ? `${formatPercentage(budgetProgress)} do orçamento utilizado`
                  : "Sem dados suficientes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Despesa / Receita</span>
                  <span className={`font-medium ${
                    budgetStatus === "good" 
                      ? "text-green-500" 
                      : budgetStatus === "warning" 
                        ? "text-amber-500" 
                        : "text-red-500"
                  }`}>
                    {formatCurrency(summary.totalExpense)} / {formatCurrency(summary.totalIncome)}
                  </span>
                </div>
                
                <Progress 
                  value={budgetProgress} 
                  className={cn(
                    "h-2",
                    {
                      "[&>div]:bg-green-500": budgetStatus === "good",
                      "[&>div]:bg-amber-500": budgetStatus === "warning",
                      "[&>div]:bg-red-500": budgetStatus === "danger"
                    }
                  )}
                />
                
                <div className="text-xs text-muted-foreground flex items-center mt-2">
                  {budgetStatus === "good" ? (
                    <Sparkles className="h-3 w-3 text-green-500 mr-1" />
                  ) : budgetStatus === "warning" ? (
                    <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  
                  {budgetStatus === "good" 
                    ? "Orçamento saudável"
                    : budgetStatus === "warning" 
                      ? "Aproximando-se do limite"
                      : "Orçamento excedido"
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Status de Pagamento</CardTitle>
              <CardDescription>Distribuição das despesas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pagas</span>
                    <span className="font-medium">{formatCurrency(summary.totalPaidExpense)}</span>
                  </div>
                  <Progress value={
                    summary.totalExpense 
                      ? (summary.totalPaidExpense / summary.totalExpense) * 100 
                      : 0
                  } className="h-2 bg-muted [&>div]:bg-green-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pendentes</span>
                    <span className="font-medium">{formatCurrency(summary.totalPendingExpense)}</span>
                  </div>
                  <Progress value={
                    summary.totalExpense 
                      ? (summary.totalPendingExpense / summary.totalExpense) * 100 
                      : 0
                  } className="h-2 bg-muted [&>div]:bg-yellow-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Agendadas</span>
                    <span className="font-medium">{formatCurrency(summary.totalScheduledExpense)}</span>
                  </div>
                  <Progress value={
                    summary.totalExpense 
                      ? (summary.totalScheduledExpense / summary.totalExpense) * 100 
                      : 0
                  } className="h-2 bg-muted [&>div]:bg-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
