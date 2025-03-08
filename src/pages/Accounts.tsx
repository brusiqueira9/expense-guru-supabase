import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  created_at: string;
}

export default function Accounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking',
    balance: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchAccounts();
    }
  }, [user?.id]);

  async function fetchAccounts() {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      toast.error('Erro ao buscar contas');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!user?.id) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('accounts')
        .insert([{
          ...newAccount,
          user_id: user.id
        }]);

      if (error) throw error;
      
      toast.success('Conta criada com sucesso');
      fetchAccounts();
      setNewAccount({ name: '', type: 'checking', balance: 0 });
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      toast.error('Erro ao criar conta: ' + error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas bancárias
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Conta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Nome da conta"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newAccount.type}
                  onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                  required
                  aria-label="Tipo de conta"
                >
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Conta Poupança</option>
                  <option value="investment">Conta Investimento</option>
                  <option value="credit">Cartão de Crédito</option>
                </select>
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Saldo inicial"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit">
                Criar Conta
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Carregando contas...</p>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="p-6 bg-card rounded-lg shadow border"
            >
              <h3 className="text-lg font-semibold">{account.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {account.type === 'checking' && 'Conta Corrente'}
                {account.type === 'savings' && 'Conta Poupança'}
                {account.type === 'investment' && 'Conta Investimento'}
                {account.type === 'credit' && 'Cartão de Crédito'}
              </p>
              <div className="mt-4">
                <span className="text-2xl font-bold">
                  {formatCurrency(account.balance)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 