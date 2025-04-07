import { useEffect, useContext, useState } from 'react';
import { useTransactions } from '@/context/TransactionContext';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatters';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import { supabase } from '@/lib/supabase';
import { BellIcon, XCircleIcon, CheckCircle2Icon, AlertCircleIcon, InfoIcon, CalendarDaysIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import * as React from 'react';

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
    showToasts: false // Alterado para false para desativar notificações pop-up
  });

  // Calcular contagem de notificações não lidas
  const unreadCount = notificationHistory.filter(n => !n.isRead).length;

  // Carregar notificações do localStorage ao iniciar
  useEffect(() => {
    if (auth?.user?.id) {
      const storedNotifications = localStorage.getItem(`notifications:${auth.user.id}`);
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications);
        setNotificationHistory(parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        })));
      }

      const storedPreferences = localStorage.getItem(`notification_preferences:${auth.user.id}`);
      if (storedPreferences) {
        setNotificationPreferences(JSON.parse(storedPreferences));
      }
      
      const readNotificationIds = localStorage.getItem(`read_notifications:${auth.user.id}`);
      if (readNotificationIds) {
        setReadNotifications(new Set(JSON.parse(readNotificationIds)));
      }
    }
  }, [auth?.user?.id]);

  // Salvar notificações no localStorage quando mudarem
  useEffect(() => {
    if (auth?.user?.id && notificationHistory.length > 0) {
      localStorage.setItem(`notifications:${auth.user.id}`, JSON.stringify(notificationHistory));
    }
  }, [notificationHistory, auth?.user?.id]);

  // Salvar preferências de notificação
  useEffect(() => {
    if (auth?.user?.id) {
      localStorage.setItem(`notification_preferences:${auth.user.id}`, JSON.stringify(notificationPreferences));
    }
  }, [notificationPreferences, auth?.user?.id]);

  // Salvar ids de notificações lidas
  useEffect(() => {
    if (auth?.user?.id && readNotifications.size > 0) {
      localStorage.setItem(`read_notifications:${auth.user.id}`, JSON.stringify(Array.from(readNotifications)));
    }
  }, [readNotifications, auth?.user?.id]);

  const markAsRead = (id: string) => {
    setReadNotifications(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });

    // Atualizar também no histórico
    setNotificationHistory(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    // Marcar todas as notificações como lidas
    const allIds = notificationHistory.map(n => n.id);
    setReadNotifications(new Set(allIds));
    
    // Atualizar histórico
    setNotificationHistory(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );

    // Atualizar status de notificações de transações no banco
    const transactionIds = notificationHistory
      .filter(n => n.transactionId && !n.isRead)
      .map(n => n.transactionId);
    
    if (transactionIds.length > 0) {
      transactionIds.forEach(id => {
        if (id) markNotificationAsRead(id);
      });
    }
  };

  const clearAllNotifications = () => {
    setNotificationHistory([]);
    if (auth?.user?.id) {
      localStorage.removeItem(`notifications:${auth.user.id}`);
    }
  };

  const updateNotificationPreferences = (preferences: Partial<typeof notificationPreferences>) => {
    setNotificationPreferences(prev => ({
      ...prev,
      ...preferences
    }));
  };

  // Função para adicionar uma nova notificação
  const addNotification = (props: NotificationProps) => {
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
      showToast = false // Forçar para false, ignorando as preferências globais
    } = props;

    // Verificar preferências do usuário
    if (!notificationPreferences.showTransactionReminders && type === 'transaction') return;
    if (!notificationPreferences.showGoalUpdates && type === 'goal') return;
    if (!notificationPreferences.showFinancialTips && type === 'info') return;

    // Verificar nível de prioridade mínimo
    const priorityLevels: Record<PriorityLevel, number> = { high: 3, medium: 2, low: 1 };
    if (priorityLevels[priority] < priorityLevels[notificationPreferences.minPriority]) return;

    // Verificar se já foi lida
    if (isRead || readNotifications.has(id)) return;

    // Adicionar ao histórico
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
      relatedEntityId
    };

    setNotificationHistory(prev => [newNotification, ...prev].slice(0, 50));

    // Exibir toast apenas se showToast for true
    if (showToast) {
      // Criar conteúdo para o toast
      const renderToastContent = () => {
        // Em vez de usar JSX diretamente, criamos o conteúdo como texto formatado
        let content = `<div style="text-align: left;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <strong>${title}</strong>
            ${priority === 'high' ? '<span style="background-color: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">Urgente</span>' : ''}
          </div>
          <p style="font-size: 0.875rem; white-space: pre-line; margin: 0;">${message}</p>
        </div>`;
        
        return content;
      };

      // Configurar ações do toast
      const toastActions: Record<string, any> = {
        duration: priority === 'high' ? 10000 : 6000,
      };

      // Adicionar ação personalizada se fornecida
      if (actionLabel && actionCallback) {
        toastActions.action = {
          label: actionLabel,
          onClick: () => {
            actionCallback();
            markAsRead(id);
          }
        };
      } else {
        // Ação padrão para marcar como lida
        toastActions.action = {
          label: "Marcar como Lida",
          onClick: () => markAsRead(id)
        };
      }

      // Exibir toast com base no tipo
      switch (type) {
        case 'success':
          toast.success(title, {
            description: message,
            ...toastActions
          });
          break;
        case 'error':
          toast.error(title, {
            description: message,
            ...toastActions
          });
          break;
        case 'warning':
          toast.warning(title, {
            description: message,
            ...toastActions
          });
          break;
        case 'info':
        case 'goal':
          toast.info(title, {
            description: message,
            ...toastActions
          });
          break;
        case 'transaction':
        case 'reminder':
          toast.warning(title, {
            description: message,
            ...toastActions
          });
          break;
      }
    }

    return id;
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
    // Só executar se o usuário estiver autenticado e as transações estiverem carregadas
    if (!auth?.user || loading || !notificationPreferences.showTransactionReminders) return;

    // Obter data atual no formato ISO sem timezone (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Calcular 3 dias a partir de hoje usando manipulação de string ISO
    const getDateInXDays = (dateStr: string, days: number) => {
      const date = new Date(dateStr + 'T00:00:00');
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    };
    
    const threeDaysFromNow = getDateInXDays(today, 3);
    
    // Agrupar despesas por dia de vencimento
    const upcomingExpensesByDay = new Map<string, any[]>();
    
    transactions.forEach(t => {
      if (t.type !== 'expense' || !t.dueDate || t.paymentStatus === 'paid' || t.isnotificationread) return;
      
      // Usar string de data diretamente para comparação (formato YYYY-MM-DD)
      const dueDate = t.dueDate;
      if (dueDate >= today && dueDate <= threeDaysFromNow) {
        if (!upcomingExpensesByDay.has(dueDate)) {
          upcomingExpensesByDay.set(dueDate, []);
        }
        upcomingExpensesByDay.get(dueDate)!.push(t);
      }
    });

    // Notificar por dia de vencimento
    upcomingExpensesByDay.forEach((expenses, dateStr) => {
      // Calcular dias até o vencimento como diferença entre strings de data
      const getDaysBetween = (start: string, end: string) => {
        const startDate = new Date(start + 'T00:00:00');
        const endDate = new Date(end + 'T00:00:00');
        return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      };
      
      const daysUntilDue = getDaysBetween(today, dateStr);
      
      // Determinar a prioridade com base na proximidade do vencimento
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
      
      // Criar mensagem de notificação com formatação melhorada
      let message = `Valor total: ${formatCurrency(totalAmount)}\n\n`;
      
      // Adicionar todas as despesas na mensagem, limitando a 5
      expenses.slice(0, 5).forEach(expense => {
        message += `• ${expense.description || expense.category}: ${formatCurrency(expense.amount)}\n`;
      });
      
      if (expenses.length > 5) {
        message += `\n...e mais ${expenses.length - 5} despesa(s)`;
      }

      // Tratar como uma única notificação agrupada com ID baseado na data
      const notificationId = `upcoming-expenses-${dateStr}`;
      
      // Adicionar notificação com ação personalizada, sem exibir toast
      addNotification({
        id: notificationId,
        title,
        message,
        type: 'transaction',
        priority,
        actionLabel: "Ver Despesas",
        actionCallback: () => {
          // Navegar para a página de transações e aplicar filtros
          navigate('/transactions');
          updateFilters({
            type: 'expense',
            paymentStatus: 'pending' // Corrigido para aceitar apenas um status
          });
          
          // Marcar notificações como lidas
          expenses.forEach(expense => {
            markNotificationAsRead(expense.id);
          });
        },
        transactionId: expenses[0].id, // Referência ao primeiro ID para rastreamento
        showToast: false // Não exibir toast automático
      });
    });
  }, [transactions, navigate, updateFilters, auth?.user, readNotifications, loading, notificationPreferences]);

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
          showToast: false
        });
        
        addNotification({
          title: "Meta de economia próxima",
          message: "Você já alcançou 80% da sua meta de economia para 'Férias'. Continue assim!",
          type: 'goal',
          priority: 'medium',
          actionLabel: "Ver meta",
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
          title: `Dica financeira: ${randomTip.title}`,
          message: randomTip.message,
          type: 'info',
          priority: 'low',
          showToast: false // Não exibir toast automático
        });
        
        // Registrar que mostrou dica hoje com data ISO
        localStorage.setItem(`last_tip_date:${auth?.user?.id}`, today);
      }, 10000);
    }
  }, [auth?.user, notificationPreferences]);

  return {
    notificationHistory,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    addNotification,
    notificationPreferences,
    updateNotificationPreferences,
    unreadCount,
    // Adicionar notificação de teste para demonstrar o funcionamento
    createTestNotification: () => {
      const notificationTypes: NotificationType[] = ['success', 'error', 'warning', 'info', 'transaction', 'goal', 'reminder'];
      const priorityLevels: PriorityLevel[] = ['high', 'medium', 'low'];
      
      const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const randomPriority = priorityLevels[Math.floor(Math.random() * priorityLevels.length)];
      
      const notifications = {
        success: {
          title: 'Operação bem-sucedida!',
          message: 'Sua solicitação foi processada com sucesso.'
        },
        error: {
          title: 'Erro ao processar',
          message: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.'
        },
        warning: {
          title: 'Atenção!',
          message: 'Algumas informações podem estar incompletas.'
        },
        info: {
          title: 'Dica financeira',
          message: 'Economize até 30% separando 10% do seu salário todo mês.'
        },
        transaction: {
          title: 'Lembrete de transação',
          message: 'Você tem uma despesa a vencer nos próximos dias.'
        },
        goal: {
          title: 'Meta alcançada!',
          message: 'Parabéns! Você alcançou 50% da sua meta de economia.'
        },
        reminder: {
          title: 'Lembrete',
          message: 'Não esqueça de verificar suas transações recentes.'
        }
      };
      
      const notification = notifications[randomType];
      
      const newNotification: NotificationProps = {
        title: notification.title,
        message: notification.message,
        type: randomType,
        priority: randomPriority,
        actionLabel: 'Ver detalhes',
        actionCallback: () => console.log('Ação da notificação de teste executada'),
        showToast: false // Garantir que não seja exibido como toast
      };
      
      addNotification(newNotification);
      
      return 'Notificação de teste criada e adicionada ao centro de notificações';
    }
  };
} 