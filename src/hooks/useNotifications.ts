import { useEffect, useContext, useState } from 'react';
import { useTransactions } from '@/context/TransactionContext';
import { formatCurrency } from '@/lib/formatters';
import { AuthContext } from '@/App';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Tipos de notificações
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'transaction' | 'goal' | 'reminder';

// Níveis de prioridade
export type PriorityLevel = 'high' | 'medium' | 'low';

// Interface para histórico de notificações
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: PriorityLevel;
  createdAt: Date;
  isRead: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
  category?: string;
  transactionId?: string;
  relatedEntityId?: string;
  userId?: string;
}

// Interface de parâmetros para novas notificações
export interface NotificationProps {
  id?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: PriorityLevel;
  isRead?: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
  category?: string;
  transactionId?: string;
  relatedEntityId?: string;
  showToast?: boolean; // Novo parâmetro para controlar exibição de toast
}

export function useNotifications() {
  const { transactions, updateFilters } = useTransactions();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [notificationHistory, setNotificationHistory] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationPreferences, setNotificationPreferences] = useState({
    showTransactionReminders: true,
    showGoalUpdates: true,
    showFinancialTips: true,
    minPriority: 'low' as PriorityLevel,
    showToasts: false
  });

  const { user } = useAuth();
  const userId = user?.id;

  // Calcular contagem de notificações não lidas
  const unreadCount = notificationHistory.filter(n => !n.isRead).length;

  // Carregar notificações do localStorage ao iniciar
  useEffect(() => {
    if (!userId) return;

    try {
      const storedNotifications = localStorage.getItem(`notifications:${userId}`);
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications);
        const userNotifications = parsed.filter((n: any) => n.userId === userId);
        setNotificationHistory(userNotifications.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          userId
        })));
      }

      const storedPreferences = localStorage.getItem(`notification_preferences:${userId}`);
      if (storedPreferences) {
        setNotificationPreferences(JSON.parse(storedPreferences));
      }
      
      const readNotificationIds = localStorage.getItem(`read_notifications:${userId}`);
      if (readNotificationIds) {
        setReadNotifications(new Set(JSON.parse(readNotificationIds)));
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  }, [userId]);

  // Salvar notificações no localStorage quando mudarem
  useEffect(() => {
    if (!userId || notificationHistory.length === 0) return;

    try {
      const notificationsWithUserId = notificationHistory.map(notification => ({
        ...notification,
        userId
      }));
      localStorage.setItem(`notifications:${userId}`, JSON.stringify(notificationsWithUserId));
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
    }
  }, [notificationHistory, userId]);

  const markAsRead = (id: string) => {
    setReadNotifications(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });

    setNotificationHistory(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    const allIds = notificationHistory.map(n => n.id);
    setReadNotifications(new Set(allIds));
    setNotificationHistory(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotificationHistory([]);
    if (userId) {
      localStorage.removeItem(`notifications:${userId}`);
    }
  };

  const updateNotificationPreferences = (preferences: Partial<typeof notificationPreferences>) => {
    setNotificationPreferences(prev => ({
      ...prev,
      ...preferences
    }));
  };

  const addNotification = (props: NotificationProps) => {
    if (!userId) return;

    const { 
      id = crypto.randomUUID(), 
      title, 
      message, 
      type, 
      priority = 'medium', 
      isRead = false,
      actionLabel,
      actionCallback,
      category,
      transactionId,
      relatedEntityId,
      showToast = false
    } = props;

    if (!notificationPreferences.showTransactionReminders && type === 'transaction') return;
    if (!notificationPreferences.showGoalUpdates && type === 'goal') return;
    if (!notificationPreferences.showFinancialTips && type === 'info') return;

    if (priority === 'low' && notificationPreferences.minPriority === 'medium') return;
    if (priority === 'low' && notificationPreferences.minPriority === 'high') return;
    if (priority === 'medium' && notificationPreferences.minPriority === 'high') return;

    const newNotification: NotificationItem = {
      id,
      title,
      message,
      type,
      priority,
      createdAt: new Date(),
      isRead,
      actionLabel,
      actionCallback,
      category,
      transactionId,
      relatedEntityId,
      userId
    };

    setNotificationHistory(prev => [...prev, newNotification]);

    if (showToast && notificationPreferences.showToasts) {
      toast(title, {
        description: message,
        duration: 5000,
      });
    }
  };
  
  // Função para marcar notificação de transação como lida no Supabase
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

  // Verificar e notificar sobre despesas que vencem nos próximos dias
  useEffect(() => {
    if (!auth?.user || loading || !notificationPreferences.showTransactionReminders) return;

    const today = new Date().toISOString().split('T')[0];
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysFromNowStr = threeDaysFromNow.toISOString().split('T')[0];
    
    const upcomingExpensesByDay = new Map<string, any[]>();
    
    transactions.forEach(t => {
      if (t.type !== 'expense' || !t.dueDate || t.paymentStatus === 'paid' || t.isnotificationread) return;
      
      const dueDate = t.dueDate;
      if (dueDate >= today && dueDate <= threeDaysFromNowStr) {
        if (!upcomingExpensesByDay.has(dueDate)) {
          upcomingExpensesByDay.set(dueDate, []);
        }
        upcomingExpensesByDay.get(dueDate)!.push(t);
      }
    });

    upcomingExpensesByDay.forEach((expenses, dateStr) => {
      const daysUntilDue = Math.round(
        (new Date(dateStr).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      let priority: PriorityLevel = 'medium';
      if (daysUntilDue === 0) priority = 'high';
      else if (daysUntilDue === 1) priority = 'medium';
      else priority = 'low';
      
      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      let title: string;
      if (daysUntilDue === 0) {
        title = `${expenses.length} despesa(s) vencem HOJE!`;
      } else if (daysUntilDue === 1) {
        title = `${expenses.length} despesa(s) vencem AMANHÃ!`;
      } else {
        title = `${expenses.length} despesa(s) vencem em ${daysUntilDue} dias`;
      }
      
      let message = `Valor total: ${formatCurrency(totalAmount)}\n\n`;
      
      expenses.slice(0, 5).forEach(expense => {
        message += `• ${expense.description || expense.category}: ${formatCurrency(expense.amount)}\n`;
      });
      
      if (expenses.length > 5) {
        message += `\n...e mais ${expenses.length - 5} despesa(s)`;
      }

      const notificationId = `upcoming-expenses-${dateStr}`;
      
      addNotification({
        id: notificationId,
        title,
        message,
        type: 'transaction',
        priority,
        actionLabel: "Ver Despesas",
        actionCallback: () => {
          navigate('/transactions');
          updateFilters({
            type: 'expense',
            paymentStatus: 'pending'
          });
        },
        showToast: false
      });
    });
  }, [transactions, auth?.user, loading, notificationPreferences, navigate, updateFilters]);

  // Atualizar o estado de carregamento quando as transações são carregadas
  useEffect(() => {
    if (transactions.length > 0) {
      setLoading(false);
    }
  }, [transactions]);

  // Adicionar algumas notificações de teste na inicialização
  useEffect(() => {
    if (!auth?.user) return;

    // Verificar se já foram adicionadas notificações de teste
    const notificationsAdded = localStorage.getItem(`test_notifications_added:${auth.user.id}`);
    
    if (!notificationsAdded) {
      // Adicionar um atraso para garantir que as notificações apareçam após o login
      setTimeout(() => {
        // Adicionar algumas notificações de teste
        addNotification({
          title: "Bem-vindo ao Expense Guru!",
          message: "Clique no ícone de sino para ver suas notificações e alertas financeiros.",
          type: 'info',
          priority: 'medium',
          showToast: false
        });
        
        addNotification({
          title: "Despesa próxima do vencimento",
          message: "Você tem uma fatura de cartão de crédito vencendo em 3 dias no valor de R$ 1.250,00.",
          type: 'transaction',
          priority: 'high',
          actionLabel: "Ver detalhes",
          actionCallback: () => {
            // Marcar notificações como lidas
          },
          showToast: false
        });
        
        addNotification({
          title: "Meta de economia próxima",
          message: "Você já alcançou 80% da sua meta de economia para 'Férias'. Continue assim!",
          type: 'goal',
          priority: 'medium',
          actionLabel: "Ver meta",
          actionCallback: () => {
            // Marcar notificações como lidas
          },
          showToast: false
        });
        
        // Marcar que as notificações de teste já foram adicionadas
        if (auth?.user?.id) {
          localStorage.setItem(`test_notifications_added:${auth.user.id}`, 'true');
        }
      }, 3000);
    }
  }, [auth?.user]);

  // Adicionar dicas financeiras periódicas
  useEffect(() => {
    if (!auth?.user || !notificationPreferences.showFinancialTips) return;
    
    // Verificar se já mostrou dica hoje
    const lastTipDate = localStorage.getItem(`last_tip_date:${auth.user.id}`);
    const today = new Date().toISOString().split('T')[0]; // Formato ISO YYYY-MM-DD
    
    if (lastTipDate !== today) {
      // Array de dicas financeiras
      const financialTips = [
        {
          title: "Regra 50/30/20",
          message: "Tente alocar 50% da sua renda para necessidades, 30% para desejos e 20% para economias e investimentos."
        },
        {
          title: "Fundo de Emergência",
          message: "Procure manter um fundo de emergência equivalente a 3-6 meses de despesas para imprevistos."
        },
        {
          title: "Revisão Mensal",
          message: "Reserve um dia por mês para revisar suas finanças e ajustar seu orçamento conforme necessário."
        },
        {
          title: "Automatize Suas Economias",
          message: "Configure transferências automáticas para sua conta de investimentos logo após receber seu salário."
        },
        {
          title: "Priorize Dívidas",
          message: "Pague primeiro as dívidas com taxas de juros mais altas para economizar no longo prazo."
        }
      ];
      
      // Escolher uma dica aleatória
      const randomTip = financialTips[Math.floor(Math.random() * financialTips.length)];
      
      // Adicionar dica como notificação, sem exibir toast
      setTimeout(() => {
        addNotification({
          title: randomTip.title,
          message: randomTip.message,
          type: 'info',
          priority: 'medium',
          showToast: false
        });
      }, 3000);
    }
  }, [auth?.user, notificationPreferences]);

  return {
    notificationHistory: notificationHistory.filter(notification => notification.userId === userId),
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    addNotification,
    notificationPreferences,
    updateNotificationPreferences,
    unreadCount: notificationHistory.filter(n => !n.isRead && n.userId === userId).length
  };
}