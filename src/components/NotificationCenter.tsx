import React, { useState } from 'react';
import { useNotifications, NotificationItem, PriorityLevel } from '@/hooks/useNotifications';
import { 
  Bell, 
  CheckSquare, 
  Trash2, 
  Settings, 
  X, 
  Clock,
  AlertTriangle,
  CheckCircle2, 
  Info,
  ChevronDown,
  ChevronUp,
  Sliders,
  BellOff,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

// Componente de item de notificação
const NotificationCard = ({ 
  notification, 
  onAction 
}: { 
  notification: NotificationItem; 
  onAction: () => void; 
}) => {
  const priorityColors = {
    high: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    medium: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    low: 'bg-slate-50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800',
  };

  const typeIcons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <X className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    transaction: <Clock className="h-5 w-5 text-purple-500" />,
    goal: <Bell className="h-5 w-5 text-indigo-500" />,
    reminder: <Bell className="h-5 w-5 text-orange-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`mb-2 shadow-sm border transition-colors ${notification.isRead ? 'bg-background opacity-70' : priorityColors[notification.priority]}`}>
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-center">
              {typeIcons[notification.type]}
              <div>
                <CardTitle className="text-sm font-medium">
                  {notification.title}
                  {notification.priority === 'high' && !notification.isRead && (
                    <Badge variant="destructive" className="ml-2 text-[10px] h-4">Urgente</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  {formatDistanceToNow(new Date(notification.createdAt), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-0 px-4">
          <p className="text-sm whitespace-pre-line">{notification.message}</p>
        </CardContent>
        {(notification.actionLabel || !notification.isRead) && (
          <CardFooter className="py-2 px-4 flex justify-end">
            {notification.actionLabel ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-7"
                onClick={onAction}
              >
                {notification.actionLabel}
              </Button>
            ) : !notification.isRead ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7"
                onClick={onAction}
              >
                Marcar como lida
              </Button>
            ) : null}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

// Componente de Centro de Notificações
export function NotificationCenter() {
  const { 
    notificationHistory, 
    markAsRead, 
    markAllAsRead,
    clearAllNotifications,
    notificationPreferences,
    updateNotificationPreferences,
    unreadCount
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  // Filtrar notificações baseado na aba ativa e filtro de tipo
  const filteredNotifications = notificationHistory.filter(notification => {
    if (activeTab === 'unread' && notification.isRead) return false;
    if (typeFilter && notification.type !== typeFilter) return false;
    return true;
  });

  // Métodos para gerenciar notificações
  const handleAction = (notification: NotificationItem) => {
    if (notification.actionCallback) {
      notification.actionCallback();
    }
    markAsRead(notification.id);
  };

  // Função para renderizar o título do botão de notificações
  const renderTriggerTitle = () => {
    return (
      <div className="relative">
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-yellow-600 animate-pulse' : ''}`} />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 px-1 min-w-[18px] h-[18px] flex items-center justify-center" 
            variant="destructive"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </div>
    );
  };

  // Tipos de notificações para filtro
  const notificationTypes = [
    { value: 'transaction', label: 'Transações' },
    { value: 'success', label: 'Sucesso' },
    { value: 'error', label: 'Erro' },
    { value: 'warning', label: 'Alerta' },
    { value: 'info', label: 'Informação' },
    { value: 'goal', label: 'Metas' },
    { value: 'reminder', label: 'Lembretes' },
  ];

  // Controlador de abertura e fechamento da folha de notificação
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    
    // Ao abrir a folha, se estiver na aba de não lidas e não houver notificações não lidas,
    // mudar para a aba "todas"
    if (newOpen && activeTab === 'unread' && unreadCount === 0) {
      setActiveTab('all');
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant={unreadCount > 0 ? "secondary" : "ghost"} 
          size="icon" 
          title="Notificações" 
          aria-label="Abrir centro de notificações"
          className={unreadCount > 0 ? "border border-yellow-500 text-foreground" : ""}
        >
          {renderTriggerTitle()}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center justify-between">
            <span>Notificações</span>
            {unreadCount > 0 && (
              <Badge variant="secondary">
                {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="unread" disabled={unreadCount === 0}>Não lidas</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <div className="flex gap-1">
              {(activeTab === 'all' || activeTab === 'unread') && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    title="Filtrar notificações"
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Mais opções"
                      >
                        <Sliders className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {unreadCount > 0 && (
                        <DropdownMenuItem onClick={markAllAsRead}>
                          <CheckSquare className="mr-2 h-4 w-4" />
                          <span>Marcar todas como lidas</span>
                        </DropdownMenuItem>
                      )}
                      {notificationHistory.length > 0 && (
                        <DropdownMenuItem 
                          onClick={clearAllNotifications}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Limpar histórico</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>

          {showFilter && (activeTab === 'all' || activeTab === 'unread') && (
            <Card className="mb-4">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex justify-between items-center">
                  <span>Filtrar notificações</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => setShowFilter(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={typeFilter || ""}
                  onValueChange={(value) => setTypeFilter(value === "" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    {notificationTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {filteredNotifications.map(notification => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onAction={() => handleAction(notification)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <BellOff className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">
                    {typeFilter 
                      ? 'Nenhuma notificação encontrada com este filtro'
                      : 'Nenhuma notificação para exibir'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {filteredNotifications.map(notification => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onAction={() => handleAction(notification)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <CheckSquare className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">
                    Todas as notificações foram lidas
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preferências de Notificações</CardTitle>
                <CardDescription>
                  Configure como você deseja receber as notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="toast-notifications" 
                      checked={notificationPreferences.showToasts}
                      onCheckedChange={(checked) => updateNotificationPreferences({ 
                        showToasts: checked === true 
                      })}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="toast-notifications">
                        Mostrar notificações pop-up (toasts)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Exibe notificações emergentes na tela quando ocorrem eventos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="transaction-notifications" 
                      checked={notificationPreferences.showTransactionReminders}
                      onCheckedChange={(checked) => updateNotificationPreferences({ 
                        showTransactionReminders: checked === true 
                      })}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="transaction-notifications">
                        Lembretes de Transações
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notificações sobre despesas a vencer e outros eventos de transações
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="goal-notifications" 
                      checked={notificationPreferences.showGoalUpdates}
                      onCheckedChange={(checked) => updateNotificationPreferences({ 
                        showGoalUpdates: checked === true 
                      })}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="goal-notifications">
                        Atualizações de Metas
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações sobre o progresso de suas metas financeiras
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="tips-notifications" 
                      checked={notificationPreferences.showFinancialTips}
                      onCheckedChange={(checked) => updateNotificationPreferences({ 
                        showFinancialTips: checked === true 
                      })}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="tips-notifications">
                        Dicas Financeiras
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receba dicas periódicas para melhorar sua saúde financeira
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority-level">Nível de Prioridade Mínimo</Label>
                  <Select 
                    value={notificationPreferences.minPriority}
                    onValueChange={(value: PriorityLevel) => updateNotificationPreferences({ 
                      minPriority: value 
                    })}
                  >
                    <SelectTrigger id="priority-level">
                      <SelectValue placeholder="Selecione o nível mínimo de prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta (apenas urgentes)</SelectItem>
                      <SelectItem value="medium">Média (média e alta)</SelectItem>
                      <SelectItem value="low">Baixa (todas)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Você só receberá notificações com prioridade igual ou superior à selecionada
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
} 