import React, { useState } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const { transactions, summary } = useTransactions();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date(8640000000000000); // Max date
    
    return transactionDate >= start && transactionDate <= end;
  });

  const calculateSummary = () => {
    const incomeTotal = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenseTotal = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: incomeTotal,
      totalExpense: expenseTotal,
      balance: incomeTotal - expenseTotal,
    };
  };

  const reportSummary = calculateSummary();

  const handleGeneratePDF = () => {
    // Create new document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Relatório Financeiro", 105, 15, { align: "center" });
    
    // Add period subtitle
    doc.setFontSize(12);
    const periodText = startDate && endDate 
      ? `Período: ${formatDate(startDate)} a ${formatDate(endDate)}`
      : "Todas as transações";
    doc.text(periodText, 105, 25, { align: "center" });
    
    // Add summary section
    doc.setFontSize(16);
    doc.text("Resumo", 14, 40);
    
    doc.setFontSize(12);
    doc.text(`Total de Receitas: ${formatCurrency(reportSummary.totalIncome)}`, 14, 50);
    doc.text(`Total de Despesas: ${formatCurrency(reportSummary.totalExpense)}`, 14, 58);
    doc.text(`Saldo: ${formatCurrency(reportSummary.balance)}`, 14, 66);
    
    // Add transactions table
    doc.setFontSize(16);
    doc.text("Transações", 14, 85);
    
    // Format data for table
    const tableData = filteredTransactions.map(t => [
      formatDate(t.date),
      t.type === "income" ? "Receita" : "Despesa",
      t.category,
      t.description || "-",
      t.type === "income" 
        ? formatCurrency(t.amount) 
        : `- ${formatCurrency(t.amount)}`,
    ]);
    
    doc.setFontSize(12);
    autoTable(doc, {
      startY: 90,
      head: [["Data", "Tipo", "Categoria", "Descrição", "Valor"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [85, 85, 85] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    
    // Save PDF
    const fileName = `relatorio-financeiro${startDate ? '-' + startDate : ''}${endDate ? '-' + endDate : ''}.pdf`;
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
              <Calendar className="h-5 w-5" />
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
                <p className="text-2xl font-bold text-income">
                  {formatCurrency(reportSummary.totalIncome)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-expense">
                  {formatCurrency(reportSummary.totalExpense)}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Saldo</p>
              <p className={`text-2xl font-bold ${reportSummary.balance >= 0 ? "text-income" : "text-expense"}`}>
                {formatCurrency(reportSummary.balance)}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredTransactions.length} transação(ões) no período
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 