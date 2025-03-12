import { useEffect, useContext, useState } from 'react';
import { useTransactions } from '@/context/TransactionContext';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatters';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import { supabase } from '@/lib/supabase';

interface NotificationProps {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isRead?: boolean;
}

export function useNotifications() {
  const { transactions, updateFilters } = useTransactions();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const markAsRead = (id: string) => {
    setReadNotifications(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const addNotification = ({ title, message, type, isRead = false }: NotificationProps) => {
    if (isRead || readNotifications.has(title)) return;

    switch (type) {
      case 'success':
        toast.success(message, { description: title });
        break;
      case 'error':
        toast.error(message, { description: title });
        break;
      case 'warning':
        toast.warning(message, { description: title });
        break;
      case 'info':
        toast.info(message, { description: title });
        break;
    }
  };
  
  async function markNotificationAsRead(transactionId: string) {
    const { error } = await supabase
      .from('transactions')
      .update({ isnotificationread: true })
      .eq('id', transactionId);

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    } else {
      markAsRead(transactionId);
    }
  }

  useEffect(() => {
    // Só executar se o usuário estiver autenticado e as transações estiverem carregadas
    if (!auth?.user || loading) return;

    // Verificar despesas que vencem nos próximos 3 dias
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Início do dia atual
    
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3); // 3 dias a partir de hoje
    
    const upcomingExpenses = transactions.filter(t => {
      if (t.type !== 'expense' || !t.dueDate || t.paymentStatus === 'paid' || t.isnotificationread) return false;
      
      const dueDate = new Date(t.dueDate + 'T00:00:00');
      return dueDate >= today && dueDate <= threeDaysFromNow;
    });

    // Notificar o usuário sobre despesas próximas do vencimento
    if (upcomingExpenses.length > 0) {
      // Calcular o valor total das despesas próximas
      const totalAmount = upcomingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Criar mensagem de notificação
      let message = `Você tem ${upcomingExpenses.length} despesa(s) vencendo nos próximos 3 dias.\n`;
      message += `Valor total: ${formatCurrency(totalAmount)}\n\n`;
      
      // Adicionar até 3 despesas na mensagem
      upcomingExpenses.slice(0, 3).forEach(expense => {
        message += `${expense.description || expense.category}: ${formatCurrency(expense.amount)}\n`;
      });
      
      if (upcomingExpenses.length > 3) {
        message += `...e mais ${upcomingExpenses.length - 3} despesa(s)`;
      }
      
      // Mostrar notificação
      toast.warning(message, {
        duration: 8000, // Mostrar por 8 segundos
        action: {
          label: "Marcar como Lida",
          onClick: () => {
            // Marcar notificações como lidas
            upcomingExpenses.forEach(expense => {
              markNotificationAsRead(expense.id);
              markAsRead(expense.description || expense.category);
            });
            // Recarregar a página após marcar como lida
            window.location.reload();
          }
        }
      });
    }
  }, [transactions, navigate, updateFilters, auth?.user, readNotifications, loading]);

  // Atualizar o estado de carregamento quando as transações são carregadas
  useEffect(() => {
    if (transactions.length > 0) {
      setLoading(false);
    }
  }, [transactions]);

  return { addNotification, markAsRead };
} 