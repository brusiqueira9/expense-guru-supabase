import React from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import { formatCurrency } from "@/lib/formatters";

const COLORS = ["#22c55e", "#ef4444"];

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
        });
      }
      
      const monthData = data.get(monthKey);
      if (transaction.type === 'income') {
        monthData.income += transaction.amount;
      } else {
        monthData.expense += transaction.amount;
      }
    });
    
    return Array.from(data.values());
  }, [transactions]);

  // Dados para o gráfico de pizza (distribuição de categorias)
  const categoryData = React.useMemo(() => {
    const data = new Map();
    
    transactions.forEach(transaction => {
      if (!data.has(transaction.category)) {
        data.set(transaction.category, 0);
      }
      data.set(transaction.category, data.get(transaction.category) + transaction.amount);
    });
    
    return Array.from(data.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gráficos</h1>
        <p className="text-muted-foreground">
          Visualize seus dados financeiros
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="income" fill="#22c55e" name="Receitas" />
                  <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 