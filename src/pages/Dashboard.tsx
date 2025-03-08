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
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
    .filter(t => t.type === 'expense' && t.paymentStatus !== 'paid' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas finanças
        </p>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Diferença entre receitas e despesas
            </p>
          </CardContent>
        </Card>

        <Card>
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

        <Card>
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
      </div>

      {/* Status das Despesas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
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
              <Progress value={paidPercentage} className="bg-green-100 dark:bg-green-900">
                <div className="bg-green-500 h-full transition-all" style={{ width: `${paidPercentage}%` }} />
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
              <Progress value={pendingPercentage} className="bg-yellow-100 dark:bg-yellow-900">
                <div className="bg-yellow-500 h-full transition-all" style={{ width: `${pendingPercentage}%` }} />
              </Progress>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Próximas Despesas</CardTitle>
            <CardDescription>Despesas pendentes ou agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingExpenses.length > 0 ? (
                upcomingExpenses.map(expense => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{expense.description || expense.category}</p>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Vence em {new Date(expense.dueDate!).toLocaleDateString('pt-BR')}
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
      </div>

      {/* Maiores Transações */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Maiores Despesas do Mês</CardTitle>
            <CardDescription>Top 3 despesas do mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topExpenses.length > 0 ? (
                topExpenses.map(expense => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{expense.description || expense.category}</p>
                      <p className="text-xs text-muted-foreground">{expense.category}</p>
                    </div>
                    <span className="text-sm font-medium text-red-500">
                      {formatCurrency(expense.amount)}
                    </span>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Maiores Receitas do Mês</CardTitle>
            <CardDescription>Top 3 receitas do mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topIncomes.length > 0 ? (
                topIncomes.map(income => (
                  <div key={income.id} className="flex items-center justify-between">
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
      </div>

      {/* Indicadores Mensais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receitas do Mês
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(currentMonthIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Despesas do Mês
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(currentMonthExpense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo do Mês
            </CardTitle>
            <PiggyBankIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(currentMonthIncome - currentMonthExpense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Pagamento
            </CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {totalExpenses ? (paidPercentage).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              das despesas pagas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 