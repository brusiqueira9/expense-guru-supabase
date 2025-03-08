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
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description: string;
  type: 'income' | 'expense';
  created_at: string;
}

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState<{
    name: string;
    description: string;
    type: 'income' | 'expense';
  }>({
    name: '',
    description: '',
    type: 'expense'
  });

  useEffect(() => {
    if (user?.id) {
      fetchCategories();
    }
  }, [user?.id]);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro ao buscar categorias');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!user?.id) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('categories')
        .insert([{
          ...newCategory,
          user_id: user.id
        }]);

      if (error) throw error;
      
      toast.success('Categoria criada com sucesso');
      fetchCategories();
      setNewCategory({ name: '', description: '', type: 'expense' });
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria: ' + error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias das suas transações
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Nome da categoria"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Descrição"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'income' | 'expense' })}
                  required
                  aria-label="Tipo de categoria"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>
              <Button type="submit">
                Criar Categoria
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Carregando categorias...</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="p-6 bg-card rounded-lg shadow border"
            >
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {category.description}
              </p>
              <div className="mt-4">
                <span className={`text-xs font-medium ${
                  category.type === 'income' ? 'text-income' : 'text-expense'
                }`}>
                  {category.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 