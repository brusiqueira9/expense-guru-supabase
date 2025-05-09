import React, { useState } from "react";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { TransactionFiltersComponent } from "@/components/TransactionFilters";
import { FinancialSummary } from "@/components/FinancialSummary";
import { MonthSelector } from "@/components/MonthSelector";
import { useTransactions } from "@/context/TransactionContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, CalendarRange, Plus, Filter, BarChart, Receipt, ArrowUpDown, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/formatters";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Transactions() {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState("todas");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { currentMonthDisplay, filteredTransactions, summary, filters, clearFilters } = useTransactions();
  const navigate = useNavigate();

  // Calcular números para exibição rápida
  const pendingCount = filteredTransactions.filter(t => t.type === 'expense' && t.paymentStatus === 'pending').length;
  const upcomingCount = filteredTransactions.filter(t => 
    t.type === 'expense' && 
    t.paymentStatus !== 'paid' && 
    new Date(t.dueDate || t.date) >= new Date()
  ).length;
  const recentCount = filteredTransactions.filter(t => {
    const txDate = new Date(t.date);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return txDate >= oneWeekAgo;
  }).length;

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">Nova Transação</DialogTitle>
              <DialogDescription className="text-sm">
                Adicione uma nova receita ou despesa
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <TransactionForm onSubmit={() => setOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Seletor de Mês */}
      <MonthSelector />
      
      {/* Cards Rápidos para Insights Financeiros */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 flex justify-between items-center">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Saldo</p>
              <p className={`text-base md:text-xl font-semibold ${summary.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
            <div className={`p-1.5 md:p-2 rounded-full ${summary.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <ArrowUpDown className={`h-4 w-4 md:h-5 md:w-5 ${summary.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView("pendentes")}>
          <CardContent className="p-3 md:p-4 flex justify-between items-center">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Pendentes</p>
              <p className="text-base md:text-xl font-semibold text-yellow-500">{pendingCount}</p>
            </div>
            <div className="p-1.5 md:p-2 rounded-full bg-yellow-100">
              <Receipt className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView("proximas")}>
          <CardContent className="p-3 md:p-4 flex justify-between items-center">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Próximas</p>
              <p className="text-base md:text-xl font-semibold text-blue-500">{upcomingCount}</p>
            </div>
            <div className="p-1.5 md:p-2 rounded-full bg-blue-100">
              <CalendarRange className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView("recentes")}>
          <CardContent className="p-3 md:p-4 flex justify-between items-center">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Recentes</p>
              <p className="text-base md:text-xl font-semibold text-purple-500">{recentCount}</p>
            </div>
            <div className="p-1.5 md:p-2 rounded-full bg-purple-100">
              <History className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="todas" value={activeView} onValueChange={setActiveView}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="todas" className="text-xs md:text-sm">Todas</TabsTrigger>
            <TabsTrigger value="pendentes" className="text-xs md:text-sm">Pendentes</TabsTrigger>
            <TabsTrigger value="proximas" className="text-xs md:text-sm">Próximas</TabsTrigger>
            <TabsTrigger value="recentes" className="text-xs md:text-sm">Recentes</TabsTrigger>
            <TabsTrigger value="resumo" className="text-xs md:text-sm">Resumo</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-1 text-xs md:text-sm"
            >
              <Filter className="h-3 w-3 md:h-4 md:w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-4 md:h-5 text-[10px] md:text-xs">
                  {Object.values(filters).filter(v => v !== undefined).length}
                </Badge>
              )}
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="shrink-0 p-2 md:p-3"
              >
                <X className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Filtros colapsáveis */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="my-4">
          <CollapsibleContent>
            <TransactionFiltersComponent />
          </CollapsibleContent>
        </Collapsible>
        
        {/* Conteúdo de cada tab */}
        <TabsContent value="todas" className="mt-4">
          <TransactionList 
            filter={{}} 
            emptyMessage="Nenhuma transação encontrada no período selecionado."
          />
        </TabsContent>
        
        <TabsContent value="pendentes" className="mt-4">
          <TransactionList 
            filter={{ type: 'expense', paymentStatus: 'pending' }} 
            emptyMessage="Não há transações pendentes no período selecionado."
          />
        </TabsContent>
        
        <TabsContent value="proximas" className="mt-4">
          <TransactionList 
            filter={{ upcomingOnly: true }} 
            emptyMessage="Não há transações próximas no período selecionado."
          />
        </TabsContent>
        
        <TabsContent value="recentes" className="mt-4">
          <TransactionList 
            filter={{ recentOnly: true }} 
            emptyMessage="Não há transações recentes no período selecionado."
          />
        </TabsContent>
        
        <TabsContent value="resumo" className="mt-4">
          <FinancialSummary />
        </TabsContent>
      </Tabs>
      
      <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6">
        <Button 
          size="lg" 
          className="h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-xl add-transaction-button"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </div>
    </div>
  );
} 