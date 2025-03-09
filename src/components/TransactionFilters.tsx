import React from "react";
import { useTransactions } from "@/context/TransactionContext";
import { TransactionFilters, INCOME_CATEGORIES, EXPENSE_CATEGORIES, RecurrenceType } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, Filter, RefreshCw, X } from "lucide-react";

export function TransactionFiltersComponent() {
  const { filters, updateFilters, clearFilters } = useTransactions();

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    if (value === "all") {
      const newFilters = { ...filters };
      delete newFilters[key];
      updateFilters(newFilters);
    } else {
      const newFilters = { ...filters, [key]: value };
      updateFilters(newFilters);
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Filtros</CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-8 gap-1"
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
        <CardDescription>Filtre suas transações</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="filters">
          <AccordionItem value="filters" className="border-none">
            <AccordionTrigger className="py-2">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="filter-type">Tipo</Label>
                  <Select
                    value={filters.type || "all"}
                    onValueChange={(value) => handleFilterChange("type", value)}
                  >
                    <SelectTrigger id="filter-type">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="income">Receitas</SelectItem>
                      <SelectItem value="expense">Despesas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-category">Categoria</Label>
                  <Select
                    value={filters.category || "all"}
                    onValueChange={(value) => handleFilterChange("category", value)}
                  >
                    <SelectTrigger id="filter-category">
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {INCOME_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-status">Status</Label>
                  <Select
                    value={filters.paymentStatus || "all"}
                    onValueChange={(value) => handleFilterChange("paymentStatus", value)}
                  >
                    <SelectTrigger id="filter-status">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-recurrence">Recorrência</Label>
                  <Select
                    value={filters.recurrence || "all"}
                    onValueChange={(value) => handleFilterChange("recurrence", value)}
                  >
                    <SelectTrigger id="filter-recurrence" className="flex items-center">
                      <SelectValue placeholder="Todas as recorrências" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as recorrências</SelectItem>
                      <SelectItem value="none">Sem recorrência</SelectItem>
                      <SelectItem value="daily">Diária</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-start-date">Data Inicial</Label>
                  <div className="relative">
                    <Input
                      id="filter-start-date"
                      type="date"
                      value={filters.startDate || ""}
                      onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-end-date">Data Final</Label>
                  <div className="relative">
                    <Input
                      id="filter-end-date"
                      type="date"
                      value={filters.endDate || ""}
                      onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
} 