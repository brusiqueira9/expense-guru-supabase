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
import { MonthSelector } from "@/components/MonthSelector";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const { dashboardSummary: summary, transactions, currentMonth, currentMonthDisplay } = useTransactions();

  // Calcular métricas do mês atual
  const startOfCurrentMonth = startOfMonth(currentMonth);
  const endOfCurrentMonth = endOfMonth(currentMonth);

  // Calcular métricas do mês anterior
  const previousMonth = subMonths(currentMonth, 1);
  const startOfPreviousMonth = startOfMonth(previousMonth);
  const endOfPreviousMonth = endOfMonth(previousMonth);
  const previousMonthDisplay = format(previousMonth, "MMMM", { locale: ptBR });

  // Filtrar transações do mês atual
  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= startOfCurrentMonth && date <= endOfCurrentMonth;
  });

  // Filtrar transações do mês anterior
  const lastMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= startOfPreviousMonth && date <= endOfPreviousMonth;
  });

  // Calcular totais do mês atual
  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const currentMonthBalance = currentMonthIncome - currentMonthExpense;

  // Calcular totais do mês anterior
  const lastMonthIncome = lastMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthExpense = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const lastMonthBalance = lastMonthIncome - lastMonthExpense;

  // Calcular variações percentuais
  const incomeVariation = lastMonthIncome ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
  const expenseVariation = lastMonthExpense ? ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0;
  const balanceVariation = lastMonthBalance ? ((currentMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100 : 0;

  // Calcular métricas de despesas por status
  const totalExpenses = currentMonthExpense;
  const paidExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.paymentStatus === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const pendingExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.paymentStatus === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const scheduledExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.paymentStatus === 'scheduled')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const paidPercentage = totalExpenses ? (paidExpenses / totalExpenses) * 100 : 0;
  const pendingPercentage = totalExpenses ? (pendingExpenses / totalExpenses) * 100 : 0;
  const scheduledPercentage = totalExpenses ? (scheduledExpenses / totalExpenses) * 100 : 0;

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

      {/* Seletor de Mês */}
      <div className="month-selector">
        <MonthSelector />
      </div>

      {/* Resumo do Mês Atual */}
      <motion.div variants={item} className="monthly-summary-card">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">
              Resumo de {currentMonthDisplay}
            </CardTitle>
            <CardDescription>
              Comparação com {previousMonthDisplay}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(currentMonthIncome)}
                </p>
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
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-500">
                  {formatCurrency(currentMonthExpense)}
                </p>
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
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Saldo</p>
                <p className={`text-2xl font-bold ${currentMonthBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(currentMonthBalance)}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {balanceVariation >= 0 ? (
                      <span className="text-green-500 flex items-center gap-1">
                        <TrendingUpIcon className="h-3 w-3" />
                        +{balanceVariation.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1">
                        <TrendingDownIcon className="h-3 w-3" />
                        {balanceVariation.toFixed(1)}%
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">vs. mês anterior</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cards Principais */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={container}
      >
        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saldo do Mês
              </CardTitle>
              <WalletIcon className={`h-4 w-4 ${currentMonthBalance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${currentMonthBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(currentMonthBalance)}
              </div>
              <div className="flex items-center gap-2">
                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Receitas - Despesas
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receitas do Mês
              </CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(currentMonthIncome)}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {topIncomes.length} receitas registradas
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Despesas do Mês
              </CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(currentMonthExpense)}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {topExpenses.length} despesas registradas
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Despesas Pagas
              </CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-blue-500" />
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
              <CardTitle className="text-sm font-medium">Status das Despesas do Mês</CardTitle>
              <CardDescription>Distribuição do status de pagamento em {currentMonthDisplay}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />
                      <span>Pagas</span>
                    </div>
                    <div className="flex font-medium">
                      {formatCurrency(paidExpenses)}
                      <span className="text-muted-foreground ml-2">
                        ({paidPercentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={paidPercentage} className="h-2 bg-muted" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <AlertCircleIcon className="mr-2 h-4 w-4 text-yellow-500" />
                      <span>Pendentes</span>
                    </div>
                    <div className="flex font-medium">
                      {formatCurrency(pendingExpenses)}
                      <span className="text-muted-foreground ml-2">
                        ({pendingPercentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={pendingPercentage} className="h-2 bg-muted">
                    <div 
                      className="h-full bg-yellow-500 transition-all" 
                      style={{ width: `${pendingPercentage}%` }} 
                    />
                  </Progress>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <ClockIcon className="mr-2 h-4 w-4 text-blue-500" />
                      <span>Agendadas</span>
                    </div>
                    <div className="flex font-medium">
                      {formatCurrency(scheduledExpenses)}
                      <span className="text-muted-foreground ml-2">
                        ({scheduledPercentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={scheduledPercentage} className="h-2 bg-muted">
                    <div 
                      className="h-full bg-blue-500 transition-all" 
                      style={{ width: `${scheduledPercentage}%` }} 
                    />
                  </Progress>
                </div>
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
                  upcomingExpenses.map((expense, index) => (
                    <div 
                      key={expense.id} 
                      className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{expense.description || expense.category}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarClockIcon className="mr-1 h-3.5 w-3.5" />
                          {expense.dueDate ? (
                            <span>Vencimento: {new Date(expense.dueDate).toLocaleDateString('pt-BR')}</span>
                          ) : (
                            <span>Sem data de vencimento</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-bold text-red-500">{formatCurrency(expense.amount)}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                          expense.paymentStatus === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {expense.paymentStatus === 'pending' ? 'Pendente' : 'Agendado'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Não há despesas pendentes ou agendadas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
} 