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
        <Bell className="h-5 w-5" />
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Notificações" aria-label="Abrir centro de notificações">
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
              <TabsTrigger value="unread">Não lidas</TabsTrigger>
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
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Marcar todas como lidas
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={clearAllNotifications}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpar notificações
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>

          {showFilter && (activeTab === 'all' || activeTab === 'unread') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Filtros</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex flex-wrap gap-2">
                    {notificationTypes.map((type) => (
                      <Badge
                        key={type.value}
                        variant={typeFilter === type.value ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setTypeFilter(typeFilter === type.value ? null : type.value)}
                      >
                        {type.label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[calc(100vh-150px)]">
              {filteredNotifications.length > 0 ? (
                <AnimatePresence>
                  {filteredNotifications.map((notification) => (
                    <NotificationCard 
                      key={notification.id} 
                      notification={notification} 
                      onAction={() => handleAction(notification)}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mb-4 opacity-20" />
                  <p>Não há notificações para exibir</p>
                  <p className="text-sm">As notificações aparecerão aqui quando forem recebidas</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <ScrollArea className="h-[calc(100vh-150px)]">
              {filteredNotifications.length > 0 ? (
                <AnimatePresence>
                  {filteredNotifications.map((notification) => (
                    <NotificationCard 
                      key={notification.id} 
                      notification={notification} 
                      onAction={() => handleAction(notification)}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mb-4 opacity-20" />
                  <p>Não há notificações não lidas</p>
                  <p className="text-sm">Todas as suas notificações foram lidas</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <ScrollArea className="h-[calc(100vh-150px)]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preferências de Notificações</CardTitle>
                  <CardDescription>
                    Personalize como você deseja receber notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">Tipos de Notificações</h3>
                    <Separator />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="showTransactionReminders" 
                        checked={notificationPreferences.showTransactionReminders}
                        onCheckedChange={(checked) => {
                          updateNotificationPreferences({ 
                            showTransactionReminders: !!checked 
                          });
                        }}
                      />
                      <Label htmlFor="showTransactionReminders">
                        Lembretes de transações e pagamentos
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="showGoalUpdates" 
                        checked={notificationPreferences.showGoalUpdates}
                        onCheckedChange={(checked) => {
                          updateNotificationPreferences({ 
                            showGoalUpdates: !!checked 
                          });
                        }}
                      />
                      <Label htmlFor="showGoalUpdates">
                        Atualizações sobre metas financeiras
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="showFinancialTips" 
                        checked={notificationPreferences.showFinancialTips}
                        onCheckedChange={(checked) => {
                          updateNotificationPreferences({ 
                            showFinancialTips: !!checked 
                          });
                        }}
                      />
                      <Label htmlFor="showFinancialTips">
                        Dicas financeiras e sugestões
                      </Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <h3 className="font-medium text-sm">Nível de Prioridade Mínimo</h3>
                    <Separator />
                    <p className="text-sm text-muted-foreground">
                      Só receba notificações com o nível de prioridade selecionado ou superior
                    </p>
                  </div>
                  
                  <Select 
                    value={notificationPreferences.minPriority}
                    onValueChange={(value: PriorityLevel) => {
                      updateNotificationPreferences({ minPriority: value });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a prioridade mínima" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Todas as Notificações (Baixa)</SelectItem>
                      <SelectItem value="medium">Média e Alta</SelectItem>
                      <SelectItem value="high">Apenas Urgentes (Alta)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-end">
                  <Button onClick={() => setActiveTab('all')}>
                    Salvar e Voltar
                  </Button>
                </CardFooter>
              </Card>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <SheetFooter className="mt-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">Fechar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 