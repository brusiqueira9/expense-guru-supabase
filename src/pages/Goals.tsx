import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, PlusCircle, Target, Trash2, Edit2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<FinancialGoal>>({
    name: "",
    target_amount: 0,
    current_amount: 0,
    deadline: "",
    category: "",
  });

  useEffect(() => {
    if (user?.id) {
      fetchGoals();
    }
  }, [user?.id]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar metas:", error);
      toast.error("Erro ao buscar metas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateGoal = async () => {
    try {
      if (!user?.id) {
        toast.error("Usuário não autenticado");
        return;
      }

      if (!newGoal.name || !newGoal.target_amount || !newGoal.deadline) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      const goalData = {
        ...newGoal,
        user_id: user.id,
        current_amount: newGoal.current_amount || 0,
        category: newGoal.category || "Geral",
      };

      let error;

      if (isEditing && selectedGoal?.id) {
        const { error: updateError } = await supabase
          .from("goals")
          .update(goalData)
          .eq("id", selectedGoal.id)
          .eq("user_id", user.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("goals")
          .insert([goalData]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(isEditing ? "Meta atualizada com sucesso!" : "Meta criada com sucesso!");
      fetchGoals();
      handleCloseDialog();
    } catch (error: any) {
      console.error("Erro ao salvar meta:", error);
      toast.error("Erro ao salvar meta: " + error.message);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Meta excluída com sucesso!");
      fetchGoals();
    } catch (error: any) {
      console.error("Erro ao excluir meta:", error);
      toast.error("Erro ao excluir meta: " + error.message);
    }
  };

  const handleEditGoal = (goal: FinancialGoal) => {
    setIsEditing(true);
    setSelectedGoal(goal);
    setNewGoal({
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      deadline: goal.deadline,
      category: goal.category || "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditing(false);
    setSelectedGoal(null);
    setDialogOpen(false);
    setNewGoal({
      name: "",
      target_amount: 0,
      current_amount: 0,
      deadline: "",
      category: "",
    });
  };

  const calculateProgress = (goal: FinancialGoal) => {
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  const calculateRemainingDays = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas Financeiras</h1>
          <p className="text-muted-foreground">
            Defina e acompanhe suas metas financeiras
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsEditing(false);
              setNewGoal({
                name: "",
                target_amount: 0,
                current_amount: 0,
                deadline: "",
                category: "",
              });
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent onInteractOutside={handleCloseDialog}>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Meta" : "Nova Meta Financeira"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Atualize sua meta financeira" : "Defina uma nova meta para suas finanças"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-name">Nome da Meta</Label>
                <Input
                  id="goal-name"
                  value={newGoal.name || ""}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Reserva de Emergência"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-target">Valor Alvo</Label>
                <Input
                  id="goal-target"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newGoal.target_amount || ""}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target_amount: parseFloat(e.target.value) }))}
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-current">Valor Atual</Label>
                <Input
                  id="goal-current"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newGoal.current_amount || ""}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, current_amount: parseFloat(e.target.value) }))}
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-deadline">Data Limite</Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={newGoal.deadline || ""}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-category">Categoria</Label>
                <Input
                  id="goal-category"
                  value={newGoal.category || ""}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Ex: Emergência, Viagem, etc."
                />
              </div>
              <Button onClick={handleAddOrUpdateGoal} className="w-full">
                {isEditing ? "Atualizar Meta" : "Criar Meta"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Carregando metas...</p>
        ) : goals.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Target className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma meta definida</h3>
            <p className="text-muted-foreground">
              Comece criando sua primeira meta financeira
            </p>
          </div>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5" />
                    {goal.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditGoal(goal)}
                    >
                      <Edit2 className="h-4 w-4" />
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
                          <AlertDialogTitle>Excluir Meta</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a meta "{goal.name}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardDescription>{goal.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{Math.round(calculateProgress(goal))}%</span>
                  </div>
                  <Progress value={calculateProgress(goal)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Atual</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(goal.current_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Meta</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(goal.target_amount)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prazo</p>
                  <p className="text-sm font-medium">
                    {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                    {" "}
                    <span className="text-muted-foreground">
                      ({calculateRemainingDays(goal.deadline)} dias restantes)
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 