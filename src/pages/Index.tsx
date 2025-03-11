
import React, { useState, useEffect } from "react";
import { TransactionProvider } from "@/context/TransactionContext";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { FinancialSummary } from "@/components/FinancialSummary";
import { ReportGenerator } from "@/components/ReportGenerator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, List, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Index() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");
  
  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }

  return (
    <TransactionProvider>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
        <div className="container px-4 py-8 md:py-16 mx-auto max-w-screen-xl">
          <div className="mx-auto max-w-5xl">
            <header className="text-center mb-10 md:mb-16 space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Controle Financeiro
              </h1>
              <p className="text-muted-foreground text-lg">
                Gerencie suas receitas e despesas de forma simples e eficiente
              </p>
            </header>
            
            <FinancialSummary />
            
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className={cn(
                "lg:col-span-5 space-y-6",
                activeTab === "add" ? "block" : "hidden lg:block"
              )}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight">Nova Transação</h2>
                </div>
                <TransactionForm />
              </div>
              
              <div className="lg:col-span-7">
                <div className="lg:hidden mb-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="transactions" className="flex items-center gap-1.5">
                        <List className="h-4 w-4" />
                        <span>Transações</span>
                      </TabsTrigger>
                      <TabsTrigger value="add" className="flex items-center gap-1.5">
                        <PlusCircle className="h-4 w-4" />
                        <span>Adicionar</span>
                      </TabsTrigger>
                      <TabsTrigger value="report" className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        <span>Relatório</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="transactions">
                      <TransactionList />
                    </TabsContent>
                    
                    <TabsContent value="report">
                      <ReportGenerator />
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div className="hidden lg:block space-y-6">
                  <TransactionList />
                  
                  <div className="mt-10">
                    <ReportGenerator />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TransactionProvider>
  );
}
