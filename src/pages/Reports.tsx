import React, { useState, useEffect } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Calendar, FileBarChart } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { MonthSelector } from "@/components/MonthSelector";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Reports() {
  const { transactions, currentMonth, currentMonthDisplay } = useTransactions();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [useMonthFilter, setUseMonthFilter] = useState(true);

  // Atualizar as datas de início e fim com base no mês selecionado
  useEffect(() => {
    if (useMonthFilter) {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      setStartDate(format(start, 'yyyy-MM-dd'));
      setEndDate(format(end, 'yyyy-MM-dd'));
    }
  }, [currentMonth, useMonthFilter]);

  // Filtrar transações com base nas datas selecionadas
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date(8640000000000000); // Max date
    
    return transactionDate >= start && transactionDate <= end;
  });

  // Calcular sumário com base nas transações filtradas
  const calculateSummary = () => {
    const incomeTotal = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenseTotal = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calcular despesas por status
    const paidExpenses = filteredTransactions
      .filter(t => t.type === 'expense' && t.paymentStatus === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const pendingExpenses = filteredTransactions
      .filter(t => t.type === 'expense' && t.paymentStatus === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const scheduledExpenses = filteredTransactions
      .filter(t => t.type === 'expense' && t.paymentStatus === 'scheduled')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: incomeTotal,
      totalExpense: expenseTotal,
      balance: incomeTotal - expenseTotal,
      paidExpenses,
      pendingExpenses,
      scheduledExpenses
    };
  };

  const reportSummary = calculateSummary();

  const handleGeneratePDF = () => {
    // Create new document
    const doc = new jsPDF();
    
    // Configurar fonte que suporta caracteres acentuados
    doc.setFont("helvetica");
    
    // Add title
    doc.setFontSize(20);
    doc.text("Relatório Financeiro", 105, 15, { align: "center" });
    
    // Add period subtitle
    doc.setFontSize(12);
    let periodText = "";
    
    if (useMonthFilter) {
      periodText = `Período: ${currentMonthDisplay}`;
    } else if (startDate && endDate) {
      periodText = `Período: ${formatDate(startDate)} a ${formatDate(endDate)}`;
    } else {
      periodText = "Todas as transações";
    }
    
    doc.text(periodText, 105, 25, { align: "center" });
    
    // Add summary section
    doc.setFontSize(16);
    doc.text("Resumo", 14, 40);
    
    doc.setFontSize(12);
    doc.text(`Total de Receitas: ${formatCurrency(reportSummary.totalIncome)}`, 14, 50);
    doc.text(`Total de Despesas: ${formatCurrency(reportSummary.totalExpense)}`, 14, 58);
    doc.text(`Saldo: ${formatCurrency(reportSummary.balance)}`, 14, 66);
    
    // Adicionar informações de status de pagamento
    doc.text("Status das Despesas:", 14, 76);
    doc.text(`• Pagas: ${formatCurrency(reportSummary.paidExpenses)}`, 20, 84);
    doc.text(`• Pendentes: ${formatCurrency(reportSummary.pendingExpenses)}`, 20, 92);
    doc.text(`• Agendadas: ${formatCurrency(reportSummary.scheduledExpenses)}`, 20, 100);
    
    // Add transactions table
    doc.setFontSize(16);
    doc.text("Transações", 14, 115);
    
    // Format data for table
    const tableData = filteredTransactions.map(t => [
      formatDate(t.date),
      t.type === "income" ? "Receita" : "Despesa",
      t.category,
      t.description || "-",
      t.type === "income" 
        ? formatCurrency(t.amount) 
        : `- ${formatCurrency(t.amount)}`,
      t.type === "expense" ? t.paymentStatus === "paid" ? "Pago" : 
                            t.paymentStatus === "pending" ? "Pendente" : 
                            t.paymentStatus === "scheduled" ? "Agendado" : "-" : "-"
    ]);
    
    doc.setFontSize(12);
    autoTable(doc, {
      startY: 120,
      head: [["Data", "Tipo", "Categoria", "Descrição", "Valor", "Status"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [85, 85, 85] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    
    // Save PDF
    let fileName = "relatorio-financeiro";
    if (useMonthFilter) {
      fileName += `-${format(currentMonth, 'yyyy-MM')}`;
    } else if (startDate && endDate) {
      fileName += `-${startDate}-a-${endDate}`;
    }
    fileName += ".pdf";
    
    doc.save(fileName);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Gere relatórios detalhados das suas finanças
        </p>
      </div>
      
      {/* Seletor de mês para os relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período do Relatório
          </CardTitle>
          <CardDescription>
            Selecione o período para gerar o relatório
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="use-month-filter"
              checked={useMonthFilter}
              onChange={() => setUseMonthFilter(!useMonthFilter)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="use-month-filter">Usar seleção mensal</Label>
          </div>
          
          {useMonthFilter ? (
            <MonthSelector />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Data Inicial</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Data Final</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório Financeiro
            </CardTitle>
            <CardDescription>
              Gere um relatório completo com todas as suas transações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium mb-2">Informações do Relatório:</p>
              <ul className="space-y-1 text-sm">
                <li>• Período: {useMonthFilter ? currentMonthDisplay : (startDate && endDate ? `${formatDate(startDate)} a ${formatDate(endDate)}` : "Todas as transações")}</li>
                <li>• Total de transações: {filteredTransactions.length}</li>
                <li>• Receitas: {filteredTransactions.filter(t => t.type === "income").length} transações</li>
                <li>• Despesas: {filteredTransactions.filter(t => t.type === "expense").length} transações</li>
              </ul>
            </div>
            
            <Button
              onClick={handleGeneratePDF}
              className="w-full"
              disabled={filteredTransactions.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Gerar PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5" />
              Resumo do Período
            </CardTitle>
            <CardDescription>
              Visualize o resumo das transações no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(reportSummary.totalIncome)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-500">
                  {formatCurrency(reportSummary.totalExpense)}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Saldo</p>
              <p className={`text-2xl font-bold ${reportSummary.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(reportSummary.balance)}
              </p>
            </div>
            
            <div className="space-y-1 mt-4 pt-4 border-t">
              <p className="text-sm font-medium">Status das Despesas</p>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Pagas:</span>
                <span className="font-medium text-right">{formatCurrency(reportSummary.paidExpenses)}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Pendentes:</span>
                <span className="font-medium text-right">{formatCurrency(reportSummary.pendingExpenses)}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Agendadas:</span>
                <span className="font-medium text-right">{formatCurrency(reportSummary.scheduledExpenses)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 