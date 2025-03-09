import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsIcon, Lock, Palette, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UserPreferences {
  id?: string;
  user_id?: string;
  name: string;
  dark_mode: boolean;
  currency: string;
  language: string;
  created_at?: string;
  updated_at?: string;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    name: user?.user_metadata?.name || "",
    dark_mode: false,
    currency: "BRL",
    language: "pt-BR"
  });

  // Aplicar tema quando as preferências mudarem
  useEffect(() => {
    const root = window.document.documentElement;
    if (preferences.dark_mode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [preferences.dark_mode]);

  // Detectar preferência do sistema ao carregar
  useEffect(() => {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setPreferences(prev => ({ ...prev, dark_mode: isDarkMode }));
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserPreferences();
    }
  }, [user?.id]);

  const fetchUserPreferences = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setPreferences(prev => ({
          ...prev,
          ...data,
          name: data.name || user?.user_metadata?.name || ""
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Primeiro, verificar se já existe um registro para o usuário
      const { data: existingData, error: fetchError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erro ao verificar preferências existentes:', fetchError);
        throw fetchError;
      }

      const preferenceData = {
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString()
      };

      let error;
      if (existingData?.id) {
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update(preferenceData)
          .eq('id', existingData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert([preferenceData]);
        error = insertError;
      }

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      // Atualizar o nome do usuário nos metadados do Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        data: { name: preferences.name }
      });

      if (updateError) {
        console.error('Erro ao atualizar metadados:', updateError);
        throw updateError;
      }

      await fetchUserPreferences(); // Recarregar as preferências
      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast.error('Erro ao salvar configurações: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('current-password') as string;
    const newPassword = formData.get('new-password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Senha atualizada com sucesso');
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error('Erro ao atualizar senha: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);
    try {
      // Primeiro deletar os dados do usuário
      const { error: deleteError } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user?.id);

      if (deleteError) throw deleteError;

      // Depois deletar a conta
      const { error } = await supabase.auth.admin.deleteUser(user?.id as string);
      if (error) throw error;

      await signOut();
      toast.success('Conta excluída com sucesso');
    } catch (error: any) {
      toast.error('Erro ao excluir conta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDarkMode = async (checked: boolean) => {
    setPreferences(prev => ({ ...prev, dark_mode: checked }));
    
    // Se o usuário estiver logado, salvar a preferência automaticamente
    if (user?.id) {
      try {
        // Primeiro, verificar se já existe um registro
        const { data: existingData, error: fetchError } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        let error;
        if (existingData?.id) {
          // Atualizar registro existente
          const { error: updateError } = await supabase
            .from('user_preferences')
            .update({
              dark_mode: checked,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingData.id);
          error = updateError;
        } else {
          // Criar novo registro
          const { error: insertError } = await supabase
            .from('user_preferences')
            .insert([{
              user_id: user.id,
              dark_mode: checked,
              name: preferences.name,
              currency: preferences.currency,
              language: preferences.language,
              updated_at: new Date().toISOString()
            }]);
          error = insertError;
        }

        if (error) throw error;
      } catch (error) {
        console.error('Erro ao salvar modo escuro:', error);
        // Reverter a mudança em caso de erro
        setPreferences(prev => ({ ...prev, dark_mode: !checked }));
        toast.error('Erro ao salvar preferência de tema');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={preferences.name}
                onChange={(e) => setPreferences(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize a aparência do aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Escuro</Label>
                <p className="text-sm text-muted-foreground">
                  Ative o tema escuro do aplicativo
                </p>
              </div>
              <Switch
                checked={preferences.dark_mode}
                onCheckedChange={handleToggleDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Idioma e Região</CardTitle>
            <CardDescription>
              Configure o idioma e a moeda do aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select
                value={preferences.currency}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (R$)</SelectItem>
                  <SelectItem value="USD">Dólar (US$)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Gerencie a segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input
                  id="current-password"
                  name="current-password"
                  type="password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  name="new-password"
                  type="password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                Atualizar Senha
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Excluir Conta
            </CardTitle>
            <CardDescription>
              Exclua permanentemente sua conta e todos os seus dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              Excluir Conta
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
} 