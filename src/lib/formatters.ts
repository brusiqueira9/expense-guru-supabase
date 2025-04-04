const currencyFormatters = {
  BRL: new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }),
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }),
  EUR: new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }),
};

export const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

// SOLUÇÃO SIMPLIFICADA PARA PROBLEMA DE DATAS:
// Em vez de tentar manipular objetos Date (que são afetados por fuso horário),
// vamos trabalhar diretamente com as strings das datas quando possível

/**
 * Interpreta uma data no formato YYYY-MM-DD (ISO) e retorna o dia, mês e ano
 * sem nenhuma manipulação de fuso horário
 */
export function parseDateParts(dateString: string): { day: number, month: number, year: number } {
  if (!dateString) {
    const now = new Date();
    return {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  }
  
  const [year, month, day] = dateString.split('-').map(Number);
  return { day, month, year };
}

/**
 * Formata uma data ISO (YYYY-MM-DD) para o formato DD/MM/YYYY
 */
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const { day, month, year } = parseDateParts(dateString);
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
};

export const formatDateForInput = (dateString: string): string => {
  return dateString;
};

/**
 * Formata uma data ISO (YYYY-MM-DD) para formato extenso (ex: 5 de janeiro de 2023)
 */
export const formatDateExtended = (dateString: string) => {
  if (!dateString) return '';
  
  const { day, month, year } = parseDateParts(dateString);
  
  // Usar um array de nomes de meses em vez de depender de formatação de Date
  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  
  return `${day} de ${monthNames[month - 1]} de ${year}`;
};

/**
 * Formata uma data ISO (YYYY-MM-DD) para formato abreviado (ex: 5 de jan)
 */
export const formatDateShort = (dateString: string) => {
  if (!dateString) return '';
  
  const { day, month } = parseDateParts(dateString);
  
  // Meses abreviados em português
  const shortMonthNames = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez'
  ];
  
  return `${day} de ${shortMonthNames[month - 1]}`;
};

/**
 * Formata uma data ISO (YYYY-MM-DD) com dia da semana para agrupar transações
 * Ex: "segunda-feira, 5 de janeiro"
 */
export const formatDateWithWeekday = (dateString: string) => {
  if (!dateString) return '';
  
  const { day, month, year } = parseDateParts(dateString);
  
  // Criar uma data temporária é necessário apenas para obter o dia da semana
  // Usamos o dia + 12h para evitar problemas de fuso horário
  const tempDate = new Date(year, month - 1, day, 12, 0, 0);
  
  const weekdays = [
    'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 
    'quinta-feira', 'sexta-feira', 'sábado'
  ];
  
  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  
  const weekday = weekdays[tempDate.getDay()];
  return `${weekday}, ${day} de ${monthNames[month - 1]}`;
};
