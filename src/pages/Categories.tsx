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
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
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

  async function handleUpdateCategory(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!editingCategory) return;

      const { error } = await supabase
        .from('categories')
        .update({
          name: editingCategory.name,
          description: editingCategory.description,
          type: editingCategory.type
        })
        .eq('id', editingCategory.id);

      if (error) throw error;
      
      toast.success('Categoria atualizada com sucesso');
      fetchCategories();
      setEditingCategory(null);
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria: ' + error.message);
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Categoria excluída com sucesso');
      fetchCategories();
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria: ' + error.message);
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

      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Nome da categoria"
                value={editingCategory?.name || ''}
                onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Descrição"
                value={editingCategory?.description || ''}
                onChange={(e) => setEditingCategory(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={editingCategory?.type || 'expense'}
                onChange={(e) => setEditingCategory(prev => prev ? { ...prev, type: e.target.value as 'income' | 'expense' } : null)}
                required
                aria-label="Tipo de categoria"
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Carregando categorias...</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="p-6 bg-card rounded-lg shadow border group relative"
            >
              <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditingCategory(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a categoria "{category.name}"? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteCategory(category.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <h3 className={cn(
                "text-lg font-semibold",
                category.type === 'income' ? 'text-green-500' : 'text-red-500'
              )}>{category.name}</h3>
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