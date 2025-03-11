
import React, { useState } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

export function ReportGenerator() {
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
    <Card className="animate-fadeIn">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Gerar Relatório
        </CardTitle>
        <CardDescription>
          Selecione um período para gerar um relatório em PDF das suas transações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {filteredTransactions.length === 0 
              ? "Nenhuma transação no período selecionado"
              : `${filteredTransactions.length} transação(ões) encontrada(s)`}
          </div>
          <Button
            onClick={handleGeneratePDF}
            disabled={filteredTransactions.length === 0}
            className="group"
          >
            <Download className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            Baixar Relatório PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
