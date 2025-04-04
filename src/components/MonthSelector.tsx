import React from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { subMonths, addMonths, format, setMonth, setYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Nomes dos meses em português
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", 
  "Maio", "Junho", "Julho", "Agosto", 
  "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function MonthSelector() {
  const { currentMonth, setMonthFilter, currentMonthDisplay } = useTransactions();
  const [open, setOpen] = React.useState(false);
  const [animate, setAnimate] = React.useState<"left" | "right" | null>(null);
  const [selectedYear, setSelectedYear] = React.useState(currentMonth.getFullYear());
  
  // Gerar array de anos (5 anos passados a 5 anos futuros)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Formatação personalizada para o mês e ano
  const monthYear = format(currentMonth, "MMMM yyyy", { locale: ptBR });
  const monthCapitalized = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

  const handlePreviousMonth = () => {
    setAnimate("left");
    setTimeout(() => {
      const previousMonth = subMonths(currentMonth, 1);
      setMonthFilter(previousMonth);
      setSelectedYear(previousMonth.getFullYear());
      setAnimate(null);
    }, 150);
  };

  const handleNextMonth = () => {
    setAnimate("right");
    setTimeout(() => {
      const nextMonth = addMonths(currentMonth, 1);
      setMonthFilter(nextMonth);
      setSelectedYear(nextMonth.getFullYear());
      setAnimate(null);
    }, 150);
  };

  const handleSelectMonth = (date: Date | undefined) => {
    if (date) {
      setMonthFilter(date);
      setSelectedYear(date.getFullYear());
      setOpen(false);
    }
  };
  
  // Selecionar mês pelo índice
  const handleSelectMonthByIndex = (monthIndex: number) => {
    const newDate = setMonth(new Date(selectedYear, 0), monthIndex);
    setMonthFilter(newDate);
    setOpen(false);
  };
  
  // Selecionar ano
  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    const newDate = setYear(currentMonth, year);
    setMonthFilter(newDate);
  };

  return (
    <Card className="mb-4 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10 p-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePreviousMonth}
            title="Mês anterior"
            className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "min-w-[220px] h-10 px-4 py-2 justify-center text-center font-medium rounded-full",
                  "bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-200",
                  "border border-gray-200 dark:border-gray-700",
                  !currentMonth && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4 text-primary" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={monthCapitalized}
                    initial={{ 
                      opacity: 0, 
                      x: animate === "left" ? 20 : animate === "right" ? -20 : 0 
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ 
                      opacity: 0, 
                      x: animate === "left" ? -20 : animate === "right" ? 20 : 0 
                    }}
                    transition={{ duration: 0.2 }}
                    className="capitalize"
                  >
                    {monthCapitalized}
                  </motion.span>
                </AnimatePresence>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg" align="center">
              <Tabs defaultValue="selector" className="w-full">
                <div className="px-3 pt-3 pb-1 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-medium text-center">Selecione um período</h3>
                  <TabsList className="grid grid-cols-2 h-8">
                    <TabsTrigger value="selector" className="text-xs px-3">Rápido</TabsTrigger>
                    <TabsTrigger value="calendar" className="text-xs px-3">Calendário</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="selector" className="mt-0">
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-4 gap-2">
                      {MONTHS.map((month, index) => (
                        <Button
                          key={month}
                          variant={currentMonth.getMonth() === index && currentMonth.getFullYear() === selectedYear ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSelectMonthByIndex(index)}
                          className={cn(
                            "text-xs h-9 w-full",
                            currentMonth.getMonth() === index && currentMonth.getFullYear() === selectedYear 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-primary/10"
                          )}
                        >
                          {month.substring(0, 3)}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ano</label>
                      <div className="flex flex-wrap gap-2">
                        {years.map(year => (
                          <Button
                            key={year}
                            variant={selectedYear === year ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSelectYear(year)}
                            className="text-xs"
                          >
                            {year}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const today = new Date();
                          setMonthFilter(today);
                          setSelectedYear(today.getFullYear());
                          setOpen(false);
                        }}
                        className="text-xs"
                      >
                        Mês atual
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => setOpen(false)}
                        className="text-xs"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="calendar" className="mt-0">
                  <CalendarComponent
                    mode="single"
                    selected={currentMonth}
                    onSelect={handleSelectMonth}
                    initialFocus
                    showOutsideDays={false}
                    fixedWeeks
                    ISOWeek
                    captionLayout="dropdown-buttons"
                    fromYear={currentYear - 5}
                    toYear={currentYear + 5}
                  />
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setMonthFilter(new Date());
                        setOpen(false);
                      }}
                      className="text-xs"
                    >
                      Mês atual
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextMonth}
            title="Próximo mês"
            className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 