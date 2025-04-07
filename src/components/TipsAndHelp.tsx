import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  HelpCircle, 
  LightbulbIcon,
  Sparkles,
  Users,
  EyeIcon,
  EyeOffIcon,
  Settings as SettingsIcon
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
// Importações necessárias para notificações
import { useNotifications } from '@/hooks/useNotifications';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// Tipos para os passos do tour
interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

// Tipos para as dicas rápidas
interface Tip {
  id: string;
  title: string;
  content: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  route?: string;
}

// Interface para preferências de dicas
interface TipsPreferences {
  showTips: boolean;
  showTour: boolean;
  tipFrequency: 'high' | 'medium' | 'low' | 'off';
}

export function TipsAndHelp() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [lastVisitedRoutes, setLastVisitedRoutes] = useState<string[]>([]);
  const [isNewUser, setIsNewUser] = useState(true);
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [tipsPreferences, setTipsPreferences] = useState<TipsPreferences>({
    showTips: true,
    showTour: true,
    tipFrequency: 'medium'
  });

  // Carregar preferências de dicas
  useEffect(() => {
    if (user?.id) {
      // Carregar dicas descartadas
      const storedDismissedTips = localStorage.getItem(`dismissed_tips:${user.id}`);
      if (storedDismissedTips) {
        setDismissedTips(JSON.parse(storedDismissedTips));
      }

      // Carregar preferências de dicas
      const storedPreferences = localStorage.getItem(`tips_preferences:${user.id}`);
      if (storedPreferences) {
        setTipsPreferences(JSON.parse(storedPreferences));
      }
    }
  }, [user?.id]);

  // Salvar preferências quando mudarem
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`tips_preferences:${user.id}`, JSON.stringify(tipsPreferences));
    }
  }, [tipsPreferences, user?.id]);

  // Verificar se é a primeira visita do usuário após o login
  useEffect(() => {
    if (user?.id) {
      const hasSeenTutorial = localStorage.getItem(`tutorial_seen:${user.id}`);
      if (!hasSeenTutorial && tipsPreferences.showTour) {
        setFirstTimeUser(true);
        // Após 1 segundo, oferece o tutorial
        const timer = setTimeout(() => {
          showTutorialOffer();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user?.id, tipsPreferences.showTour]);

  // Rastrear as rotas visitadas pelo usuário
  useEffect(() => {
    setLastVisitedRoutes(prev => {
      // Evitar duplicatas consecutivas e manter apenas últimas 5
      if (prev[0] !== location.pathname) {
        return [location.pathname, ...prev].slice(0, 5);
      }
      return prev;
    });
  }, [location.pathname]);

  // Oferecer dicas contextuais baseadas na rota atual
  useEffect(() => {
    if (!isTourActive && !showTip && user?.id && tipsPreferences.showTips) {
      // Configurar intervalo de tempo baseado na frequência
      let interval = 5000; // Padrão (medium)
      
      switch (tipsPreferences.tipFrequency) {
        case 'high':
          interval = 3000;
          break;
        case 'medium':
          interval = 5000;
          break;
        case 'low':
          interval = 10000;
          break;
        case 'off':
          return; // Não mostrar dicas
      }
      
      // Aguarde um tempo antes de mostrar a dica
      const timer = setTimeout(() => {
        const tip = getContextualTip();
        if (tip && !dismissedTips.includes(tip.id)) {
          showQuickTip(tip);
        }
      }, interval);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isTourActive, showTip, user?.id, tipsPreferences]);

  // Definir rotas para o tour com base na rota atual
  const getTourSteps = (): TourStep[] => {
    // Tour diferente para cada rota principal
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return [
          {
            target: '.monthly-summary-card',
            title: 'Resumo Mensal',
            content: 'Este é o resumo financeiro do mês atual. Você pode ver suas receitas, despesas e saldo.',
            position: 'bottom'
          },
          {
            target: '.month-selector',
            title: 'Seletor de Mês',
            content: 'Use este controle para navegar entre diferentes meses e visualizar seus dados históricos.',
            position: 'top'
          },
          {
            target: '.financial-summary',
            title: 'Resumo Financeiro',
            content: 'Aqui você vê um resumo detalhado de suas finanças, incluindo o status de suas despesas.',
            position: 'right'
          }
        ];
      case '/transactions':
        return [
          {
            target: '.transaction-filters',
            title: 'Filtros de Transações',
            content: 'Use estes filtros para encontrar transações específicas por data, tipo ou categoria.',
            position: 'bottom'
          },
          {
            target: '.transaction-list',
            title: 'Lista de Transações',
            content: 'Todas as suas transações são listadas aqui. Clique em uma para editá-la.',
            position: 'top'
          },
          {
            target: '.add-transaction-button',
            title: 'Adicionar Transação',
            content: 'Clique aqui para registrar uma nova receita ou despesa no sistema.',
            position: 'left'
          }
        ];
      case '/charts':
        return [
          {
            target: '.chart-container',
            title: 'Gráficos de Análise',
            content: 'Estes gráficos mostram a distribuição de suas receitas e despesas por categoria.',
            position: 'bottom'
          },
          {
            target: '.period-selector',
            title: 'Seletor de Período',
            content: 'Ajuste o período para visualizar seus dados em diferentes intervalos de tempo.',
            position: 'top'
          }
        ];
      default:
        return [];
    }
  };

  // Dicas rápidas baseadas no contexto
  const getAllTips = (): Tip[] => {
    return [
      {
        id: 'dashboard-intro',
        title: 'Bem-vindo ao Dashboard',
        content: 'Este é seu painel principal onde você pode ver um resumo de suas finanças.',
        category: 'beginner',
        route: '/dashboard'
      },
      {
        id: 'transaction-keyboard',
        title: 'Atalho de Teclado',
        content: 'Pressione "n t" para adicionar uma nova transação rapidamente!',
        category: 'intermediate',
        route: '/transactions'
      },
      {
        id: 'month-selector',
        title: 'Navegação entre Meses',
        content: 'Use o seletor de mês para visualizar dados de períodos anteriores.',
        category: 'beginner',
        route: '/dashboard'
      },
      {
        id: 'keyboard-shortcut-help',
        title: 'Lista de Atalhos',
        content: 'Pressione "?" para ver todos os atalhos de teclado disponíveis.',
        category: 'intermediate'
      },
      {
        id: 'chart-analysis',
        title: 'Análise Gráfica',
        content: 'Passe o mouse sobre os gráficos para ver detalhes sobre cada categoria.',
        category: 'intermediate',
        route: '/charts'
      },
      {
        id: 'budget-progress',
        title: 'Progresso do Orçamento',
        content: 'Acompanhe o progresso do seu orçamento mensal na barra de progresso.',
        category: 'beginner',
        route: '/dashboard'
      },
      {
        id: 'report-generator',
        title: 'Relatórios Personalizados',
        content: 'Você pode gerar relatórios personalizados e exportá-los como PDF.',
        category: 'advanced',
        route: '/reports'
      },
      {
        id: 'dark-mode',
        title: 'Modo Escuro',
        content: 'Experimente o modo escuro para uma experiência mais confortável à noite.',
        category: 'beginner',
        route: '/settings'
      }
    ];
  };

  // Obter uma dica contextual baseada na rota atual
  const getContextualTip = (): Tip | null => {
    const allTips = getAllTips();
    // Filtrar dicas relevantes para a rota atual
    const relevantTips = allTips.filter(tip => 
      !tip.route || tip.route === location.pathname
    );
    
    if (relevantTips.length === 0) return null;
    
    // Selecionar uma dica aleatória
    const randomIndex = Math.floor(Math.random() * relevantTips.length);
    return relevantTips[randomIndex];
  };

  // Iniciar o tour guiado
  const startTour = () => {
    setIsTourActive(true);
    setCurrentTourStep(0);
    
    // Marcar que o usuário já viu o tutorial
    if (user?.id) {
      localStorage.setItem(`tutorial_seen:${user.id}`, 'true');
      setFirstTimeUser(false);
    }
  };

  // Encerrar o tour
  const endTour = () => {
    setIsTourActive(false);
    setCurrentTourStep(0);
  };

  // Navegar para o próximo passo do tour
  const nextTourStep = () => {
    const steps = getTourSteps();
    if (currentTourStep < steps.length - 1) {
      setCurrentTourStep(prev => prev + 1);
    } else {
      endTour();
    }
  };

  // Navegar para o passo anterior do tour
  const prevTourStep = () => {
    if (currentTourStep > 0) {
      setCurrentTourStep(prev => prev - 1);
    }
  };

  // Atualizar preferências de dicas
  const updateTipsPreferences = (preferences: Partial<TipsPreferences>) => {
    setTipsPreferences(prev => ({
      ...prev,
      ...preferences
    }));
  };

  // Limpar histórico de dicas descartadas
  const resetDismissedTips = () => {
    setDismissedTips([]);
    if (user?.id) {
      localStorage.removeItem(`dismissed_tips:${user.id}`);
    }
  };

  // Mostrar uma dica rápida
  const showQuickTip = (tip: Tip) => {
    // Em vez de mostrar um toast, adicionar a dica ao centro de notificações
    if (!user?.id) return;

    // Usar o useNotifications de forma segura sem import dinâmico
    // Importar o useNotifications hook no início do arquivo
    const notificationsHook = useNotifications();
    
    // Criar um ID único para esta notificação baseado na dica
    const notificationId = `tip-${tip.id}-${new Date().getTime()}`;
    
    // Adicionar a dica como notificação
    notificationsHook.addNotification({
      id: notificationId,
      title: `Dica: ${tip.title}`,
      message: tip.content,
      type: 'info',
      priority: 'low',
      showToast: false,
      actionLabel: tip.route ? "Ir para página" : undefined,
      actionCallback: tip.route ? () => navigate(tip.route!) : undefined
    });
    
    // Adicionar à lista de dicas descartadas
    setDismissedTips(prev => [...prev, tip.id]);
    if (user?.id) {
      localStorage.setItem(`dismissed_tips:${user.id}`, JSON.stringify([...dismissedTips, tip.id]));
    }
  };

  // Mostrar oferta de tutorial
  const showTutorialOffer = () => {
    setIsTutorialOfferOpen(true);
  };

  // Mostrar menu de configurações de dicas
  const showTipsSettings = () => {
    setIsTipsSettingsOpen(true);
  };

  // Mostrar menu de ajuda
  const showHelpMenu = () => {
    setIsHelpMenuOpen(true);
  };

  // Estados para controlar a exibição de diálogos
  const [isTutorialOfferOpen, setIsTutorialOfferOpen] = useState(false);
  const [isTipsSettingsOpen, setIsTipsSettingsOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);

  // Mostrar o indicador de ajuda flutuante
  const HelpButton = () => {
    const buttonIcon = tipsPreferences.showTips ? <HelpCircle className="h-6 w-6" /> : <EyeOffIcon className="h-6 w-6" />;
    
    return (
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <Button
          size="icon"
          variant="secondary"
          className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow ${tipsPreferences.showTips ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          onClick={() => showHelpMenu()}
          title={tipsPreferences.showTips ? "Ajuda e Dicas" : "Dicas Desativadas"}
        >
          {buttonIcon}
        </Button>
      </motion.div>
    );
  };

  // Tooltip do passo atual do tour
  const TourTooltip = () => {
    const steps = getTourSteps();
    if (steps.length === 0 || !isTourActive) return null;
    
    const currentStep = steps[currentTourStep];
    
    return (
      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center pointer-events-none">
        <div className="absolute" style={{
          // Aqui seria necessário calcular a posição com base no elemento alvo
          // Para simplificar, estamos apenas centralizando
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          <Card className="w-80 pointer-events-auto shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{currentStep.title}</CardTitle>
                <Badge variant="outline" className="ml-2 text-xs">
                  {currentTourStep + 1}/{steps.length}
                </Badge>
              </div>
              <CardDescription>{currentStep.content}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={prevTourStep}
                disabled={currentTourStep === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={nextTourStep}
              >
                {currentTourStep < steps.length - 1 ? (
                  <>
                    Próximo
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  'Concluir'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isTourActive && <TourTooltip />}
      </AnimatePresence>
      
      {!firstTimeUser && <HelpButton />}

      {/* Oferta de tutorial */}
      <Dialog open={isTutorialOfferOpen} onOpenChange={setIsTutorialOfferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-blue-400 h-4 w-4" />
              Bem-vindo ao Expense Guru!
            </DialogTitle>
            <DialogDescription>
              Gostaria de fazer um tour rápido para conhecer as principais funcionalidades?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTutorialOfferOpen(false)}>
              Talvez depois
            </Button>
            <Button onClick={() => {
              startTour();
              setIsTutorialOfferOpen(false);
            }}>
              Iniciar Tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configurações de dicas */}
      <Dialog open={isTipsSettingsOpen} onOpenChange={setIsTipsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações de Dicas</DialogTitle>
            <DialogDescription>Personalize como deseja receber ajuda e dicas</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-tips">Mostrar Dicas</Label>
                <p className="text-sm text-muted-foreground">
                  Receba dicas contextuais enquanto usa o aplicativo
                </p>
              </div>
              <Switch 
                id="show-tips" 
                checked={tipsPreferences.showTips}
                onCheckedChange={(checked) => {
                  updateTipsPreferences({ showTips: checked });
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-tour">Tour Guiado para Novos Usuários</Label>
                <p className="text-sm text-muted-foreground">
                  Oferecer tour guiado para novos usuários
                </p>
              </div>
              <Switch 
                id="show-tour" 
                checked={tipsPreferences.showTour}
                onCheckedChange={(checked) => {
                  updateTipsPreferences({ showTour: checked });
                }}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="tip-frequency">Frequência de Dicas</Label>
              <select 
                id="tip-frequency"
                className="w-full p-2 rounded-md border border-input bg-background text-sm"
                value={tipsPreferences.tipFrequency}
                onChange={(e) => {
                  updateTipsPreferences({ 
                    tipFrequency: e.target.value as 'high' | 'medium' | 'low' | 'off'
                  });
                }}
                disabled={!tipsPreferences.showTips}
              >
                <option value="high">Alta - Muitas dicas</option>
                <option value="medium">Média - Equilibrado</option>
                <option value="low">Baixa - Poucas dicas</option>
                <option value="off">Desativada</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={resetDismissedTips}
              disabled={dismissedTips.length === 0}
            >
              Redefinir Dicas
            </Button>
            <Button onClick={() => setIsTipsSettingsOpen(false)}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu de ajuda */}
      <Popover open={isHelpMenuOpen} onOpenChange={setIsHelpMenuOpen}>
        <PopoverContent className="w-80">
          <div className="space-y-3 w-full">
            <h4 className="font-medium text-lg">Precisa de ajuda?</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-20 space-y-1"
                onClick={() => {
                  startTour();
                  setIsHelpMenuOpen(false);
                }}
                disabled={!tipsPreferences.showTips}
              >
                <Users className="h-5 w-5" />
                <span className="text-xs">Tour Guiado</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-20 space-y-1"
                onClick={() => {
                  const tip = getContextualTip();
                  if (tip) showQuickTip(tip);
                  setIsHelpMenuOpen(false);
                }}
                disabled={!tipsPreferences.showTips}
              >
                <LightbulbIcon className="h-5 w-5" />
                <span className="text-xs">Dica Rápida</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-20 space-y-1"
                onClick={() => {
                  document.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
                  setIsHelpMenuOpen(false);
                }}
              >
                <Info className="h-5 w-5" />
                <span className="text-xs">Atalhos</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-20 space-y-1"
                onClick={() => {
                  showTipsSettings();
                  setIsHelpMenuOpen(false);
                }}
              >
                <SettingsIcon className="h-5 w-5" />
                <span className="text-xs">Configurações</span>
              </Button>
            </div>
            <div className="flex justify-between items-center pt-2">
              <Label htmlFor="toggle-tips" className="text-sm cursor-pointer">
                {tipsPreferences.showTips ? "Desativar Dicas" : "Ativar Dicas"}
              </Label>
              <Switch 
                id="toggle-tips" 
                checked={tipsPreferences.showTips}
                onCheckedChange={(checked) => {
                  updateTipsPreferences({ showTips: checked });
                  setIsHelpMenuOpen(false);
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
} 