import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsIcon, Lock, Palette, Trash2, LightbulbIcon, EyeOff, EyeIcon, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { performLogout } from "@/lib/auth";

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

interface TipsPreferences {
  showTips: boolean;
  showTour: boolean;
  tipFrequency: 'high' | 'medium' | 'low' | 'off';
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
  const [tipsPreferences, setTipsPreferences] = useState<TipsPreferences>({
    showTips: true,
    showTour: true,
    tipFrequency: 'medium'
  });
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);

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
      loadTipsPreferences();
    }
  }, [user?.id]);

  // Carregar preferências de dicas
  const loadTipsPreferences = () => {
    if (!user?.id) return;
    
    // Carregar preferências de dicas
    const storedPreferences = localStorage.getItem(`tips_preferences:${user.id}`);
    if (storedPreferences) {
      setTipsPreferences(JSON.parse(storedPreferences));
    }
    
    // Carregar dicas descartadas
    const storedDismissedTips = localStorage.getItem(`dismissed_tips:${user.id}`);
    if (storedDismissedTips) {
      setDismissedTips(JSON.parse(storedDismissedTips));
    }
  };

  // Salvar preferências de dicas
  const saveTipsPreferences = (newPreferences: Partial<TipsPreferences>) => {
    if (!user?.id) return;
    
    const updatedPreferences = {
      ...tipsPreferences,
      ...newPreferences
    };
    
    setTipsPreferences(updatedPreferences);
    localStorage.setItem(`tips_preferences:${user.id}`, JSON.stringify(updatedPreferences));
    
    toast.success(
      newPreferences.showTips === false 
        ? "Dicas desativadas com sucesso" 
        : newPreferences.showTips === true 
          ? "Dicas ativadas com sucesso"
          : "Preferências de dicas atualizadas"
    );
  };

  // Redefinir dicas descartadas
  const resetDismissedTips = () => {
    if (!user?.id) return;
    
    setDismissedTips([]);
    localStorage.removeItem(`dismissed_tips:${user.id}`);
    toast.success("Todas as dicas foram redefinidas");
  };

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

      // Chamar a função Edge para deletar a conta
      const { error } = await supabase.functions.invoke('delete-account', {
        method: 'POST'
      });

      if (error) throw error;

      await signOut();
      toast.success('Conta excluída com sucesso');
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast.error('Erro ao excluir conta: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDarkMode = async (checked: boolean) => {
    try {
      // Atualizar o estado local primeiro
      setPreferences(prev => ({ ...prev, dark_mode: checked }));
      
      // Feedback visual direto
      const root = window.document.documentElement;
      if (checked) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      
      // Efeito visual de transição
      const overlay = document.createElement("div");
      overlay.className = "fixed inset-0 bg-background z-50 pointer-events-none";
      overlay.style.opacity = "0";
      document.body.appendChild(overlay);
      
      // Animação de fade in/out
      setTimeout(() => {
        overlay.style.transition = "opacity 300ms ease";
        overlay.style.opacity = "0.5";
        setTimeout(() => {
          overlay.style.opacity = "0";
          setTimeout(() => {
            document.body.removeChild(overlay);
          }, 300);
        }, 150);
      }, 0);
      
      // Disparar evento para ativar animações do tema
      window.dispatchEvent(new Event('themeChange'));
      
      // Salvar diretamente no banco de dados, sem depender do estado atual
      if (!user?.id) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { data: existingData, error: fetchError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erro ao verificar preferências existentes:', fetchError);
        throw fetchError;
      }

      // Preparar os dados a serem salvos
      const preferenceData = {
        user_id: user.id,
        dark_mode: checked,  // Usar o valor passado diretamente
        updated_at: new Date().toISOString()
      };

      let error;
      if (existingData?.id) {
        // Atualizar o registro existente
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update(preferenceData)
          .eq('id', existingData.id);
        error = updateError;
      } else {
        // Obter os outros valores de preferência do estado atual
        const fullPreferenceData = {
          ...preferences,  // Inclui todos os valores atuais
          ...preferenceData,  // Substitui dark_mode com o valor correto
        };
        
        // Inserir um novo registro
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert([fullPreferenceData]);
        error = insertError;
      }

      if (error) {
        console.error('Erro ao salvar modo escuro:', error);
        throw error;
      }
      
      // Mensagem de sucesso
      toast.success(checked ? "Modo escuro ativado" : "Modo claro ativado");
      
      // Recarregar as preferências para sincronizar
      await fetchUserPreferences();
    } catch (error: any) {
      console.error('Erro ao salvar modo escuro:', error);
      toast.error('Erro ao salvar configuração: ' + (error.message || 'Erro desconhecido'));
      
      // Reverter a interface em caso de erro
      setPreferences(prev => ({ ...prev, dark_mode: !checked }));
      const root = window.document.documentElement;
      if (!checked) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6 grid grid-cols-4 max-w-lg">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="tips">Dicas</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>
                Gerencie as informações do seu perfil e as preferências de conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={preferences.name}
                    onChange={(e) => setPreferences(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Selecione um idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Selecione uma moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={loading}>
                Salvar alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <span>Aparência</span>
              </CardTitle>
              <CardDescription>
                Personalize a aparência da aplicação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Ative para usar o tema escuro
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={preferences.dark_mode}
                  onCheckedChange={handleToggleDarkMode}
                  className="transition-transform data-[state=checked]:scale-105"
                />
              </div>

              <div className="flex flex-col gap-4 mt-6 rounded-lg bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                  Pré-visualização do tema
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Card className="p-3 transition-all">
                    <p className="font-medium text-sm">Texto normal</p>
                    <p className="text-xs text-muted-foreground">Texto secundário</p>
                  </Card>
                  <Card className="p-3 bg-primary text-primary-foreground transition-all">
                    <p className="font-medium text-sm">Cor primária</p>
                    <p className="text-xs text-primary-foreground/80">Texto secundário</p>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LightbulbIcon className="h-5 w-5" />
                <span>Dicas e Ajuda</span>
              </CardTitle>
              <CardDescription>
                Personalize como você recebe dicas e ajuda no aplicativo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-tips">Dicas Contextuais</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba dicas úteis enquanto usa o aplicativo
                  </p>
                </div>
                <Switch
                  id="show-tips"
                  checked={tipsPreferences.showTips}
                  onCheckedChange={(checked) => saveTipsPreferences({ showTips: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-tour">Tour Guiado para Novos Usuários</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar tour de boas-vindas para novos usuários
                  </p>
                </div>
                <Switch
                  id="show-tour"
                  checked={tipsPreferences.showTour}
                  onCheckedChange={(checked) => saveTipsPreferences({ showTour: checked })}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="tip-frequency">Frequência de Dicas</Label>
                <RadioGroup 
                  id="tip-frequency"
                  value={tipsPreferences.tipFrequency}
                  onValueChange={(value) => saveTipsPreferences({ 
                    tipFrequency: value as 'high' | 'medium' | 'low' | 'off'
                  })}
                  className="flex flex-col space-y-1"
                  disabled={!tipsPreferences.showTips}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="freq-high" />
                    <Label htmlFor="freq-high" className="cursor-pointer flex items-center gap-2">
                      Alta
                      <Badge variant="outline" className="ml-2">Muitas dicas</Badge>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="freq-medium" />
                    <Label htmlFor="freq-medium" className="cursor-pointer flex items-center gap-2">
                      Média
                      <Badge variant="outline" className="ml-2">Equilibrado</Badge>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="freq-low" />
                    <Label htmlFor="freq-low" className="cursor-pointer flex items-center gap-2">
                      Baixa
                      <Badge variant="outline" className="ml-2">Poucas dicas</Badge>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="off" id="freq-off" />
                    <Label htmlFor="freq-off" className="cursor-pointer flex items-center gap-2">
                      Desativada
                      <Badge variant="outline" className="ml-2">Sem dicas</Badge>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                onClick={resetDismissedTips} 
                variant="outline"
                disabled={!dismissedTips.length}
                className="mt-4"
              >
                Redefinir Dicas Descartadas
                <Badge variant="secondary" className="ml-2">
                  {dismissedTips.length}
                </Badge>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <span>Segurança</span>
              </CardTitle>
              <CardDescription>
                Atualize sua senha e gerencie as configurações de segurança.
              </CardDescription>
            </CardHeader>
            <CardContent>
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

              <div className="mt-8 pt-6 border-t">
                <h3 className="font-medium text-lg text-red-500 flex items-center gap-2 mb-4">
                  <Trash2 className="h-5 w-5" />
                  Zona de Perigo
                </h3>

                <div className="flex flex-col gap-4">
                  <div>
                    <Button
                      variant="outline"
                      className="w-full border-destructive/20 text-destructive hover:bg-destructive/10" 
                      onClick={() => performLogout()}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair da Conta
                    </Button>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ao excluir sua conta, todos os seus dados serão permanentemente removidos.
                      Esta ação não pode ser desfeita.
                    </p>
                    
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={loading}
                    >
                      Excluir Conta
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 