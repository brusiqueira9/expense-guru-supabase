import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { deleteWallet, updateWallet, createWallet } from '@/lib/supabaseServices';
import { LoadingButton } from '@/components/ui/loading-button';
import { useNotifications } from '@/hooks/useNotifications';

interface Wallet {
  id: number;
  name: string;
  description: string;
  balance: number;
  created_at: string;
}

export default function Wallets() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [newWallet, setNewWallet] = useState({
    name: '',
    description: '',
    balance: 0,
  });

  useEffect(() => {
    fetchWallets();
  }, []);

  async function fetchWallets() {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('name');

      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error('Erro ao buscar carteiras:', error);
      addNotification({
        title: 'Erro',
        message: 'Não foi possível carregar suas carteiras',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateWallet(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    // Validações
    if (!newWallet.name.trim()) {
      addNotification({
        title: 'Campo obrigatório',
        message: 'Por favor, informe o nome da carteira',
        type: 'error'
      });
      return;
    }

    if (newWallet.balance < 0) {
      addNotification({
        title: 'Valor inválido',
        message: 'O saldo inicial não pode ser negativo',
        type: 'error'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('wallets')
        .insert([newWallet]);

      if (error) throw error;
      
      addNotification({
        title: 'Sucesso',
        message: 'Carteira criada com sucesso!',
        type: 'success'
      });
      
      fetchWallets();
      setNewWallet({ name: '', description: '', balance: 0 });
    } catch (error) {
      console.error('Erro ao criar carteira:', error);
      addNotification({
        title: 'Erro',
        message: 'Não foi possível criar a carteira',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  const handleDeleteWallet = async (walletId: string) => {
    try {
      setIsSubmitting(true);
      const success = await deleteWallet(walletId);
      
      if (success) {
        addNotification({
          title: 'Sucesso',
          message: 'Carteira excluída com sucesso!',
          type: 'success'
        });
        fetchWallets();
      } else {
        addNotification({
          title: 'Erro',
          message: 'Não foi possível excluir a carteira',
          type: 'error'
        });
      }
    } catch (error) {
      addNotification({
        title: 'Erro',
        message: 'Não foi possível excluir a carteira',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveWallet = async (wallet: Wallet) => {
    try {
      setIsSubmitting(true);
      
      if (wallet.id) {
        const updatedWallet = await updateWallet(wallet);
        
        if (updatedWallet) {
          addNotification({
            title: 'Sucesso',
            message: 'Carteira atualizada com sucesso!',
            type: 'success'
          });
          fetchWallets();
          setSelectedWallet(null);
        } else {
          addNotification({
            title: 'Erro',
            message: 'Não foi possível atualizar a carteira',
            type: 'error'
          });
        }
      } else {
        const newWallet = await createWallet({
          ...wallet,
          user_id: user?.id || '',
        });
        
        if (newWallet) {
          addNotification({
            title: 'Sucesso',
            message: 'Carteira criada com sucesso!',
            type: 'success'
          });
          fetchWallets();
          setSelectedWallet(null);
        } else {
          addNotification({
            title: 'Erro',
            message: 'Não foi possível criar a carteira',
            type: 'error'
          });
        }
      }
    } catch (error) {
      addNotification({
        title: 'Erro',
        message: 'Não foi possível salvar a carteira',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carteiras</h1>
          <p className="text-muted-foreground">
            Gerencie seus investimentos
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <LoadingButton loading={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Carteira
            </LoadingButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Carteira</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateWallet} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Nome da carteira"
                  value={newWallet.name}
                  onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Descrição"
                  value={newWallet.description}
                  onChange={(e) => setNewWallet({ ...newWallet, description: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Saldo inicial"
                  value={newWallet.balance}
                  onChange={(e) => setNewWallet({ ...newWallet, balance: parseFloat(e.target.value) })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                loadingText="Criando carteira..."
                className="w-full"
              >
                Criar Carteira
              </LoadingButton>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-6 bg-card rounded-lg shadow border mb-6">
        <h3 className="text-lg font-semibold">Saldo Total</h3>
        <p className="text-3xl font-bold mt-2">{formatCurrency(totalBalance)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-muted-foreground">Carregando carteiras...</p>
            </div>
          </div>
        ) : wallets.length === 0 ? (
          <div className="col-span-full text-center p-8">
            <p className="text-muted-foreground">Você ainda não tem nenhuma carteira cadastrada.</p>
          </div>
        ) : (
          wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="p-6 bg-card rounded-lg shadow border"
            >
              <h3 className="text-lg font-semibold">{wallet.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {wallet.description}
              </p>
              <div className="mt-4">
                <span className="text-2xl font-bold">
                  {formatCurrency(wallet.balance)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 