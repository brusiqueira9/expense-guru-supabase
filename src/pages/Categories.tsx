import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
import { cn } from '@/lib/utils';
import { LoadingButton } from '@/components/ui/loading-button';
import { useNotifications } from '@/hooks/useNotifications';

interface Category {
  id: string;
  name: string;
  description: string;
  type: 'income' | 'expense';
  created_at: string;
}

export default function Categories() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      addNotification({
        title: 'Erro',
        message: 'Não foi possível carregar suas categorias',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    // Validações
    if (!newCategory.name.trim()) {
      addNotification({
        title: 'Campo obrigatório',
        message: 'Por favor, informe o nome da categoria',
        type: 'error'
      });
      return;
    }

    try {
      if (!user?.id) {
        addNotification({
          title: 'Erro',
          message: 'Usuário não autenticado',
          type: 'error'
        });
        return;
      }

      setIsSubmitting(true);
      const { error } = await supabase
        .from('categories')
        .insert([{
          ...newCategory,
          user_id: user.id
        }]);

      if (error) throw error;
      
      addNotification({
        title: 'Sucesso',
        message: 'Categoria criada com sucesso',
        type: 'success'
      });
      fetchCategories();
      setNewCategory({ name: '', description: '', type: 'expense' });
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      addNotification({
        title: 'Erro',
        message: 'Não foi possível criar a categoria',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      if (!editingCategory) return;

      setIsSubmitting(true);
      const { error } = await supabase
        .from('categories')
        .update({
          name: editingCategory.name,
          description: editingCategory.description,
          type: editingCategory.type
        })
        .eq('id', editingCategory.id);

      if (error) throw error;
      
      addNotification({
        title: 'Sucesso',
        message: 'Categoria atualizada com sucesso',
        type: 'success'
      });
      fetchCategories();
      setEditingCategory(null);
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error);
      addNotification({
        title: 'Erro',
        message: 'Não foi possível atualizar a categoria',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      addNotification({
        title: 'Sucesso',
        message: 'Categoria excluída com sucesso',
        type: 'success'
      });
      fetchCategories();
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      addNotification({
        title: 'Erro',
        message: 'Não foi possível excluir a categoria',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
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
            <LoadingButton loading={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </LoadingButton>
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
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Descrição"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'income' | 'expense' })}
                  required
                  disabled={isSubmitting}
                  aria-label="Tipo de categoria"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                loadingText="Criando categoria..."
                className="w-full"
              >
                Criar Categoria
              </LoadingButton>
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
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Descrição"
                value={editingCategory?.description || ''}
                onChange={(e) => setEditingCategory(prev => prev ? { ...prev, description: e.target.value } : null)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={editingCategory?.type || 'expense'}
                onChange={(e) => setEditingCategory(prev => prev ? { ...prev, type: e.target.value as 'income' | 'expense' } : null)}
                required
                disabled={isSubmitting}
                aria-label="Tipo de categoria"
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <LoadingButton
                type="button"
                variant="outline"
                onClick={() => setEditingCategory(null)}
                loading={isSubmitting}
              >
                Cancelar
              </LoadingButton>
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                loadingText="Salvando..."
              >
                Salvar
              </LoadingButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-muted-foreground">Carregando categorias...</p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center p-8">
            <p className="text-muted-foreground">Você ainda não tem nenhuma categoria cadastrada.</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="p-6 bg-card rounded-lg shadow border group relative"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <div className="flex items-center gap-2">
                  <LoadingButton
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingCategory(category)}
                    loading={isSubmitting}
                  >
                    <Pencil className="h-4 w-4" />
                  </LoadingButton>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <LoadingButton
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600"
                        loading={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </LoadingButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {category.description}
              </p>
              <div className="mt-4">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                  category.type === 'income' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
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