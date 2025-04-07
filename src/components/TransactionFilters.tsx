import React from "react";
import { useTransactions } from "@/context/TransactionContext";
import { TransactionFilters, INCOME_CATEGORIES, EXPENSE_CATEGORIES, RecurrenceType } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Filter, RefreshCw, X, ArrowDown, ArrowUp, CircleDollarSign, Clock, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  const toggleFilter = (key: keyof TransactionFilters, value: any) => {
    if (filters[key] === value) {
      const newFilters = { ...filters };
      delete newFilters[key];
      updateFilters(newFilters);
    } else {
      const newFilters = { ...filters, [key]: value };
      updateFilters(newFilters);
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);
  const activeFilterCount = Object.keys(filters).length;

  // Formatar datas para exibição
  const formatDateFilter = (dateStr?: string) => {
    if (!dateStr) return "";
    return format(new Date(dateStr), "dd 'de' MMM", { locale: ptBR });
  };

  return (
    <Card className="border border-dashed">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar tudo
            </Button>
          )}
        </div>
        <CardDescription>Refine sua visualização de transações</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Botões rápidos de filtro */}
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground font-medium tracking-wider">
              Tipo de Transação
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filters.type === 'income' ? "default" : "outline"} 
                size="sm"
                className="gap-1"
                onClick={() => toggleFilter('type', 'income')}
              >
                <ArrowUp className={`h-3.5 w-3.5 ${filters.type === 'income' ? 'text-white' : 'text-green-500'}`} />
                Receitas
              </Button>
              <Button 
                variant={filters.type === 'expense' ? "default" : "outline"} 
                size="sm"
                className="gap-1"
                onClick={() => toggleFilter('type', 'expense')}
              >
                <ArrowDown className={`h-3.5 w-3.5 ${filters.type === 'expense' ? 'text-white' : 'text-red-500'}`} />
                Despesas
              </Button>
            </div>
          </div>

          {/* Status de pagamento (só mostrar se tipo for despesa) */}
          {(filters.type === 'expense' || !filters.type) && (
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-medium tracking-wider">
                Status de Pagamento
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filters.paymentStatus === 'paid' ? "default" : "outline"} 
                  size="sm"
                  className="gap-1"
                  onClick={() => toggleFilter('paymentStatus', 'paid')}
                >
                  <Check className={`h-3.5 w-3.5 ${filters.paymentStatus === 'paid' ? 'text-white' : 'text-green-500'}`} />
                  Pagas
                </Button>
                <Button 
                  variant={filters.paymentStatus === 'pending' ? "default" : "outline"} 
                  size="sm"
                  className="gap-1"
                  onClick={() => toggleFilter('paymentStatus', 'pending')}
                >
                  <Clock className={`h-3.5 w-3.5 ${filters.paymentStatus === 'pending' ? 'text-white' : 'text-yellow-500'}`} />
                  Pendentes
                </Button>
                <Button 
                  variant={filters.paymentStatus === 'scheduled' ? "default" : "outline"} 
                  size="sm"
                  className="gap-1"
                  onClick={() => toggleFilter('paymentStatus', 'scheduled')}
                >
                  <Calendar className={`h-3.5 w-3.5 ${filters.paymentStatus === 'scheduled' ? 'text-white' : 'text-blue-500'}`} />
                  Agendadas
                </Button>
              </div>
            </div>
          )}

          {/* Filtros adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria */}
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
            
            {/* Recorrência */}
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
            
            {/* Período */}
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

          {/* Chips de filtros ativos */}
          {hasActiveFilters && (
            <div className="pt-2 border-t">
              <Label className="text-xs text-muted-foreground mb-2 block">Filtros ativos:</Label>
              <div className="flex flex-wrap gap-2">
                {filters.type && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.type === 'income' ? (
                      <>
                        <ArrowUp className="h-3 w-3 text-green-500" />
                        Receitas
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-3 w-3 text-red-500" />
                        Despesas
                      </>
                    )}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handleFilterChange('type', 'all')}
                    />
                  </Badge>
                )}
                
                {filters.paymentStatus && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.paymentStatus === 'paid' && (
                      <>
                        <Check className="h-3 w-3 text-green-500" />
                        Pagas
                      </>
                    )}
                    {filters.paymentStatus === 'pending' && (
                      <>
                        <Clock className="h-3 w-3 text-yellow-500" />
                        Pendentes
                      </>
                    )}
                    {filters.paymentStatus === 'scheduled' && (
                      <>
                        <Calendar className="h-3 w-3 text-blue-500" />
                        Agendadas
                      </>
                    )}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handleFilterChange('paymentStatus', 'all')}
                    />
                  </Badge>
                )}
                
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CircleDollarSign className="h-3 w-3" />
                    {filters.category}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handleFilterChange('category', 'all')}
                    />
                  </Badge>
                )}
                
                {filters.recurrence && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    {filters.recurrence === 'none' ? 'Sem recorrência' : 
                     filters.recurrence === 'daily' ? 'Diária' :
                     filters.recurrence === 'weekly' ? 'Semanal' :
                     filters.recurrence === 'monthly' ? 'Mensal' : 'Anual'}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handleFilterChange('recurrence', 'all')}
                    />
                  </Badge>
                )}
                
                {(filters.startDate || filters.endDate) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {filters.startDate && formatDateFilter(filters.startDate)}
                    {filters.startDate && filters.endDate && " a "}
                    {filters.endDate && formatDateFilter(filters.endDate)}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => {
                        handleFilterChange('startDate', '');
                        handleFilterChange('endDate', '');
                      }}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 