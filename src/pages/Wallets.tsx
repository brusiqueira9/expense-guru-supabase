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
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { deleteWallet, updateWallet, createWallet } from '@/lib/supabaseServices';

interface Wallet {
  id: number;
  name: string;
  description: string;
  balance: number;
  created_at: string;
}

export default function Wallets() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateWallet(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('wallets')
        .insert([newWallet]);

      if (error) throw error;
      
      fetchWallets();
      setNewWallet({ name: '', description: '', balance: 0 });
    } catch (error) {
      console.error('Erro ao criar carteira:', error);
    }
  }

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  const handleDeleteWallet = async (walletId: string) => {
    try {
      // Excluindo carteira
      
      const success = await deleteWallet(walletId);
      
      if (success) {
        // Carteira excluída com sucesso
        toast.success('Carteira excluída com sucesso!');
        fetchWallets();
      } else {
        // Erro ao excluir carteira
        toast.error('Erro ao excluir carteira');
      }
    } catch (error) {
      // Erro ao excluir carteira
      toast.error('Erro ao excluir carteira');
    }
  };

  const handleSaveWallet = async (wallet: Wallet) => {
    try {
      // Salvando carteira
      
      if (wallet.id) {
        const updatedWallet = await updateWallet(wallet);
        
        if (updatedWallet) {
          // Carteira atualizada com sucesso
          toast.success('Carteira atualizada com sucesso!');
          fetchWallets();
          setSelectedWallet(null);
        } else {
          // Erro ao atualizar carteira
          toast.error('Erro ao atualizar carteira');
        }
      } else {
        const newWallet = await createWallet({
          ...wallet,
          user_id: user?.id || '',
        });
        
        if (newWallet) {
          // Carteira criada com sucesso
          toast.success('Carteira criada com sucesso!');
          fetchWallets();
          setSelectedWallet(null);
        } else {
          // Erro ao criar carteira
          toast.error('Erro ao criar carteira');
        }
      }
    } catch (error) {
      // Erro ao salvar carteira
      toast.error('Erro ao salvar carteira');
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Carteira
            </Button>
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
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Descrição"
                  value={newWallet.description}
                  onChange={(e) => setNewWallet({ ...newWallet, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Saldo inicial"
                  value={newWallet.balance}
                  onChange={(e) => setNewWallet({ ...newWallet, balance: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Criar Carteira
              </Button>
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
          <p>Carregando carteiras...</p>
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