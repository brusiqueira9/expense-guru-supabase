import React, { useState } from "react";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { TransactionFiltersComponent } from "@/components/TransactionFilters";
import { FinancialSummary } from "@/components/FinancialSummary";
import { MonthSelector } from "@/components/MonthSelector";
import { useTransactions } from "@/context/TransactionContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, CalendarRange, Plus } from "lucide-react";
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

export default function Transactions() {
  const [open, setOpen] = useState(false);
  const { currentMonthDisplay } = useTransactions();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
              <DialogDescription>
                Adicione uma nova receita ou despesa
              </DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Seletor de Mês */}
      <MonthSelector />
      
      {/* Indicador de período */}
      <Card className="border-dashed">
        <CardContent className="py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Visualizando transações de:</span>
            <Badge variant="secondary" className="text-lg">
              {currentMonthDisplay}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Use o seletor acima para mudar o período
          </p>
        </CardContent>
      </Card>
      
      <FinancialSummary />
      
      <TransactionFiltersComponent />
      
      <div className="grid grid-cols-1 gap-4">
        <div className="transaction-filters">
          <TransactionFiltersComponent />
        </div>
        
        <div className="transaction-list">
          <TransactionList />
        </div>
      </div>
      
      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg" 
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl add-transaction-button"
          onClick={() => navigate('/?tab=add')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
} 