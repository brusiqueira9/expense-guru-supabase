import { useEffect, useContext } from 'react';
import { useTransactions } from '@/context/TransactionContext';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatters';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';

export function useNotifications() {
  const { transactions, updateFilters } = useTransactions();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  
  useEffect(() => {
    // Só executar se o usuário estiver autenticado
    if (!auth?.user) return;
    
    // Verificar despesas que vencem nos próximos 3 dias
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Início do dia atual
    
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3); // 3 dias a partir de hoje
    
    const upcomingExpenses = transactions.filter(t => {
      if (t.type !== 'expense' || !t.dueDate || t.paymentStatus === 'paid') return false;
      
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
          label: "Ver todas",
          onClick: () => {
            // Aplicar filtros para mostrar apenas despesas pendentes e agendadas
            updateFilters({
              type: 'expense',
              paymentStatus: 'pending'
            });
            
            // Navegar para a página de transações
            navigate('/transactions');
          }
        }
      });
    }
  }, [transactions, navigate, updateFilters, auth?.user]);
} 