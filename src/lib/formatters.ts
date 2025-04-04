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

// Função auxiliar para corrigir o problema de fuso horário nas datas
function createDateWithUTCCorrection(year: number, month: number, day: number): Date {
  // Criar a data com o timezone local, mas preservando o dia exato
  const date = new Date();
  date.setFullYear(year);
  date.setMonth(month);
  date.setDate(day);
  // Zerar horas, minutos e segundos para evitar problemas com a mudança do dia
  date.setHours(12, 0, 0, 0);
  return date;
}

export const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  const date = createDateWithUTCCorrection(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day)
  );
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateForInput = (dateString: string): string => {
  return dateString;
};

export const formatDateExtended = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  const date = createDateWithUTCCorrection(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day)
  );
  
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const formatDateShort = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  const date = createDateWithUTCCorrection(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day)
  );
  
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short'
  });
};
