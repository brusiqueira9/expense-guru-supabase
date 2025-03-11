import React from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  DollarSign, 
  CalendarIcon, 
  TrendingUpIcon,
  TrendingDownIcon,
  PiggyBankIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarClockIcon,
  BarChart3Icon,
  WalletIcon,
  ActivityIcon
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const { dashboardSummary: summary, transactions } = useTransactions();

  // Calcular métricas do mês atual
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const lastMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === (currentMonth - 1) && date.getFullYear() === currentYear;
  });

  // Calcular totais do mês atual
  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcular totais do mês anterior
  const lastMonthIncome = lastMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthExpense = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcular variações percentuais
  const incomeVariation = lastMonthIncome ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
  const expenseVariation = lastMonthExpense ? ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0;

  // Calcular métricas de despesas por status
  const totalExpenses = summary.totalExpense;
  const paidPercentage = (summary.totalPaidExpense / totalExpenses) * 100;
  const pendingPercentage = (summary.totalPendingExpense / totalExpenses) * 100;
  const scheduledPercentage = (summary.totalScheduledExpense / totalExpenses) * 100;

  // Encontrar maiores despesas e receitas do mês
  const topExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const topIncomes = currentMonthTransactions
    .filter(t => t.type === 'income')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // Calcular próximas despesas pendentes
  const upcomingExpenses = transactions
    .filter(t => 
      t.type === 'expense' && 
      (t.paymentStatus === 'pending' || t.paymentStatus === 'scheduled')
    )
    .sort((a, b) => {
      // Se ambos têm data de vencimento, ordenar por data
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      // Se apenas um tem data de vencimento, priorizar o que tem data
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      // Se nenhum tem data, ordenar por valor (maior primeiro)
      return b.amount - a.amount;
    })
    .slice(0, 3);

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas finanças
        </p>
      </div>

      {/* Cards Principais */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={container}
      >
        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saldo Total
              </CardTitle>
              <WalletIcon className={`h-4 w-4 ${summary.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(summary.balance)}
              </div>
              <div className="flex items-center gap-2">
                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Balanço atual
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Receitas
              </CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(summary.totalIncome)}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {incomeVariation >= 0 ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <TrendingUpIcon className="h-3 w-3" />
                      +{incomeVariation.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1">
                      <TrendingDownIcon className="h-3 w-3" />
                      {incomeVariation.toFixed(1)}%
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">vs. mês anterior</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Despesas
              </CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(summary.totalExpense)}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {expenseVariation <= 0 ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <TrendingDownIcon className="h-3 w-3" />
                      {Math.abs(expenseVariation).toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1">
                      <TrendingUpIcon className="h-3 w-3" />
                      +{expenseVariation.toFixed(1)}%
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">vs. mês anterior</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Pagamento
              </CardTitle>
              <BarChart3Icon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {totalExpenses ? (paidPercentage).toFixed(1) : 0}%
              </div>
              <Progress value={paidPercentage} className="h-2">
                <div 
                  className="h-full bg-blue-500 transition-all" 
                  style={{ width: `${paidPercentage}%` }} 
                />
              </Progress>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Status das Despesas e Próximas Despesas */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status das Despesas</CardTitle>
              <CardDescription>Distribuição do status de pagamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>Pagas</span>
                  </div>
                  <span className="font-medium">{formatCurrency(summary.totalPaidExpense)}</span>
                </div>
                <Progress value={paidPercentage} className="h-2">
                  <div 
                    className="h-full bg-green-500 transition-all" 
                    style={{ width: `${paidPercentage}%` }} 
                  />
                </Progress>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircleIcon className="h-4 w-4 text-yellow-500" />
                    <span>Pendentes</span>
                  </div>
                  <span className="font-medium">{formatCurrency(summary.totalPendingExpense)}</span>
                </div>
                <Progress value={pendingPercentage} className="h-2">
                  <div 
                    className="h-full bg-yellow-500 transition-all" 
                    style={{ width: `${pendingPercentage}%` }} 
                  />
                </Progress>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarClockIcon className="h-4 w-4 text-blue-500" />
                    <span>Agendadas</span>
                  </div>
                  <span className="font-medium">{formatCurrency(summary.totalScheduledExpense)}</span>
                </div>
                <Progress value={scheduledPercentage} className="h-2">
                  <div 
                    className="h-full bg-blue-500 transition-all" 
                    style={{ width: `${scheduledPercentage}%` }} 
                  />
                </Progress>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Próximas Despesas</CardTitle>
              <CardDescription>Despesas pendentes ou agendadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingExpenses.length > 0 ? (
                  upcomingExpenses.map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{expense.description || expense.category}</p>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            Vence em {new Date(expense.dueDate! + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-red-500">
                          {formatCurrency(expense.amount)}
                        </span>
                        {expense.paymentStatus === 'pending' ? (
                          <ClockIcon className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <CalendarClockIcon className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma despesa pendente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Maiores Transações */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Maiores Despesas do Mês</CardTitle>
              <CardDescription>Top 3 despesas do mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topExpenses.length > 0 ? (
                  topExpenses.map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{expense.description || expense.category}</p>
                        <p className="text-xs text-muted-foreground">{expense.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-red-500">
                          {formatCurrency(expense.amount)}
                        </span>
                        {expense.paymentStatus === 'paid' && (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        )}
                        {expense.paymentStatus === 'pending' && (
                          <AlertCircleIcon className="h-4 w-4 text-yellow-500" />
                        )}
                        {expense.paymentStatus === 'scheduled' && (
                          <CalendarClockIcon className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma despesa no mês atual
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Maiores Receitas do Mês</CardTitle>
              <CardDescription>Top 3 receitas do mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topIncomes.length > 0 ? (
                  topIncomes.map(income => (
                    <div key={income.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{income.description || income.category}</p>
                        <p className="text-xs text-muted-foreground">{income.category}</p>
                      </div>
                      <span className="text-sm font-medium text-green-500">
                        {formatCurrency(income.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma receita no mês atual
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
} 