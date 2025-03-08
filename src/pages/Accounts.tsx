import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!user?.id) {
        toast.error('Usuário não autenticado');
        return;
      }

      if (isEditing && selectedAccount) {
        const { error } = await supabase
          .from('accounts')
          .update({
            name: formData.name,
            type: formData.type,
            balance: formData.balance,
          })
          .eq('id', selectedAccount.id);

        if (error) throw error;
        toast.success('Conta atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('accounts')
          .insert([{
            ...formData,
            user_id: user.id
          }]);

        if (error) throw error;
        toast.success('Conta criada com sucesso');
      }
      
      fetchAccounts();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Erro ao salvar conta:', error);
      toast.error('Erro ao salvar conta: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount(id: string) {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Conta excluída com sucesso');
      fetchAccounts();
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      toast.error('Erro ao excluir conta: ' + error.message);
    }
  }

  const handleEditAccount = (account: Account) => {
    setIsEditing(true);
    setSelectedAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditing(false);
    setSelectedAccount(null);
    setDialogOpen(false);
    setFormData({
      name: '',
      type: 'checking',
      balance: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas bancárias
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsEditing(false);
              setDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Nome da conta"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
                </Button>
              </div>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{account.name}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditAccount(account)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a conta "{account.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAccount(account.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
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