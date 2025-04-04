import React, { useMemo } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
  TooltipProps,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = [
  "#22c55e", // verde
  "#ef4444", // vermelho
  "#3b82f6", // azul
  "#f59e0b", // amarelo
  "#8b5cf6", // roxo
  "#ec4899", // rosa
  "#14b8a6", // turquesa
  "#f97316", // laranja
];

const CHART_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-lg border shadow-sm">
      <p className="font-medium">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

// Adicionar função de formatação para meses abreviados e ano
const formatMonthYear = (dateString: string) => {
  // Usar Date apenas para extrair mês e ano, sem problemas de timezone
  const date = new Date(dateString);
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString().substr(-2);
  return `${month}/${year}`;
};

export default function Charts() {
  const { transactions } = useTransactions();

  // Dados para o gráfico de barras (receitas vs despesas por mês)
  const monthlyData = React.useMemo(() => {
    const data = new Map();
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!data.has(monthKey)) {
        data.set(monthKey, {
          month: monthKey,
          income: 0,
          expense: 0,
          balance: 0,
        });
      }
      
      const monthData = data.get(monthKey);
      if (transaction.type === 'income') {
        monthData.income += transaction.amount;
        monthData.balance += transaction.amount;
      } else {
        monthData.expense += transaction.amount;
        monthData.balance -= transaction.amount;
      }
    });
    
    return Array.from(data.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(data => ({
        ...data,
        month: format(new Date(data.month), "MMM/yy", { locale: ptBR })
      }));
  }, [transactions]);

  // Dados para o gráfico de pizza (distribuição de categorias)
  const categoryData = React.useMemo(() => {
    const data = new Map();
    let total = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        if (!data.has(transaction.category)) {
          data.set(transaction.category, 0);
        }
        const amount = transaction.amount;
        data.set(transaction.category, data.get(transaction.category) + amount);
        total += amount;
      }
    });
    
    return Array.from(data.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / total * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Dados para o gráfico de área (evolução das categorias ao longo do tempo)
  const categoryTimeData = React.useMemo(() => {
    const monthlyCategories = new Map();
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyCategories.has(monthKey)) {
          monthlyCategories.set(monthKey, new Map());
        }
        
        const categoryMap = monthlyCategories.get(monthKey);
        if (!categoryMap.has(transaction.category)) {
          categoryMap.set(transaction.category, 0);
        }
        
        categoryMap.set(
          transaction.category,
          categoryMap.get(transaction.category) + transaction.amount
        );
      }
    });
    
    const allCategories = new Set(categoryData.map(d => d.name));
    
    return Array.from(monthlyCategories.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, categories]) => {
        const result = {
          month: formatMonthYear(month)
        };
        
        allCategories.forEach(category => {
          result[category] = categories.get(category) || 0;
        });
        
        return result;
      });
  }, [transactions, categoryData]);

  // Dados para o gráfico de status de pagamento
  const paymentStatusData = React.useMemo(() => {
    const data = {
      paid: 0,
      pending: 0,
      scheduled: 0,
    };
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense' && transaction.paymentStatus) {
        data[transaction.paymentStatus] += transaction.amount;
      }
    });
    
    return Object.entries(data).map(([status, value]) => ({
      name: status === 'paid' ? 'Pago' : status === 'pending' ? 'Pendente' : 'Agendado',
      value,
      percentage: (value / Object.values(data).reduce((a, b) => a + b, 0) * 100).toFixed(1)
    }));
  }, [transactions]);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gráficos</h1>
        <p className="text-muted-foreground">
          Visualize seus dados financeiros de forma interativa
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div {...CHART_ANIMATION}>
          <Card>
            <CardHeader>
              <CardTitle>Evolução Financeira</CardTitle>
              <CardDescription>Acompanhe seu saldo ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          {...CHART_ANIMATION}
          className="chart-container"
        >
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas</CardTitle>
              <CardDescription>Comparação mensal de entradas e saídas</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="income" fill="#22c55e" name="Receitas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...CHART_ANIMATION} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Despesas</CardTitle>
              <CardDescription>Veja como suas despesas estão distribuídas por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-lg border shadow-sm">
                            <p className="font-medium">{data.name}</p>
                            <p>{formatCurrency(data.value)}</p>
                            <p className="text-sm text-muted-foreground">{data.percentage}%</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute bottom-0 w-full">
                  <div className="flex flex-wrap justify-center gap-2 text-sm">
                    {categoryData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...CHART_ANIMATION} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle>Evolução das Despesas por Categoria</CardTitle>
              <CardDescription>Acompanhe como suas despesas por categoria evoluem ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={categoryTimeData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {categoryData.map((category, index) => (
                      <Area
                        key={category.name}
                        type="monotone"
                        dataKey={category.name}
                        stackId="1"
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.6}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...CHART_ANIMATION} transition={{ delay: 0.8 }}>
          <Card>
            <CardHeader>
              <CardTitle>Status de Pagamento</CardTitle>
              <CardDescription>Distribuição das despesas por status de pagamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === 'Pago' ? '#22c55e' : entry.name === 'Pendente' ? '#f59e0b' : '#3b82f6'}
                          className="hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-lg border shadow-sm">
                            <p className="font-medium">{data.name}</p>
                            <p>{formatCurrency(data.value)}</p>
                            <p className="text-sm text-muted-foreground">{data.percentage}%</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute bottom-0 w-full">
                  <div className="flex flex-wrap justify-center gap-2 text-sm">
                    {paymentStatusData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ 
                            backgroundColor: entry.name === 'Pago' ? '#22c55e' : 
                                          entry.name === 'Pendente' ? '#f59e0b' : '#3b82f6'
                          }}
                        />
                        <span>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Seletor de período para filtrar gráficos */}
      <div className="period-selector flex justify-end items-center gap-2 mb-2">
        <span className="text-sm text-muted-foreground">Período:</span>
      </div>
    </div>
  );
} 