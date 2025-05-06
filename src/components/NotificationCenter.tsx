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
  Filter,
  CheckCheck,
  LayoutGrid
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";

// Componente de item de notificação
const NotificationCard = ({ 
  notification, 
  onMarkAsRead, 
  onDismiss 
}: { 
  notification: NotificationItem; 
  onMarkAsRead: (id: string) => void; 
  onDismiss: (id: string) => void; 
}) => {
  const priorityColors = {
    high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-sm shadow-red-100 dark:shadow-red-900/10',
    medium: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 shadow-sm shadow-yellow-100 dark:shadow-yellow-900/10',
    low: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm shadow-blue-100 dark:shadow-blue-900/10',
  };

  const typeIcons = {
    success: <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-500" />,
    error: <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-red-500" />,
    warning: <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-500" />,
    info: <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-500" />,
    transaction: <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-500" />,
    goal: <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-indigo-500" />,
    reminder: <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-orange-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mb-2 sm:mb-3"
    >
      <Card 
        className={`overflow-hidden transition-all duration-200 ${
          notification.isRead ? 'bg-background opacity-70 hover:opacity-90' : priorityColors[notification.priority]
        } hover:shadow-md border`}
      >
        <CardHeader className="py-1.5 px-2 sm:py-2 sm:px-3 md:py-3 md:px-4 pb-1 sm:pb-2">
          <div className="flex justify-between items-start">
            <div className="flex gap-1.5 sm:gap-2 items-center">
              <div className="p-0.5 sm:p-1 md:p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                {typeIcons[notification.type]}
              </div>
              <div>
                <CardTitle className="text-[11px] sm:text-xs md:text-sm font-medium flex items-center">
                  {notification.title}
                  {notification.priority === 'high' && !notification.isRead && (
                    <Badge variant="destructive" className="ml-1.5 sm:ml-2 text-[7px] sm:text-[8px] md:text-[10px] h-2.5 sm:h-3 md:h-4 px-1 sm:px-1.5">Urgente</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-[9px] sm:text-[10px] md:text-xs">
                  {formatDistanceToNow(new Date(notification.createdAt), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </CardDescription>
              </div>
            </div>
            
            {!notification.isRead && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 rounded-full hover:bg-background/80"
                onClick={() => onMarkAsRead(notification.id)}
              >
                <CheckCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="py-1 px-2 sm:py-1 sm:px-3 md:py-1 md:px-4">
          <p className="text-[10px] sm:text-xs md:text-sm whitespace-pre-line leading-relaxed">{notification.message}</p>
        </CardContent>
        {(notification.actionLabel || !notification.isRead) && (
          <CardFooter className="py-1 px-2 sm:py-1.5 sm:px-3 md:py-2 md:px-4 flex justify-end gap-1.5 sm:gap-2 bg-background/40 backdrop-blur-sm">
            {notification.actionLabel && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="text-[9px] sm:text-[10px] md:text-xs h-5 sm:h-6 md:h-7 px-1.5 sm:px-2 md:px-3 rounded-full"
                onClick={() => {
                  onMarkAsRead(notification.id);
                  if (notification.actionCallback) {
                    notification.actionCallback();
                  }
                }}
              >
                {notification.actionLabel}
              </Button>
            )}
            {!notification.isRead && !notification.actionLabel && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[9px] sm:text-[10px] md:text-xs h-5 sm:h-6 md:h-7 px-1.5 sm:px-2 md:px-3 rounded-full"
                onClick={() => onMarkAsRead(notification.id)}
              >
                Marcar como lida
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

// Componente do Centro de Notificações
export function NotificationCenter({ 
  show, 
  onClose 
}: { 
  show: boolean; 
  onClose: () => void;
}) {
  const { 
    notificationHistory, 
    markAsRead: originalMarkAsRead,
    markAllAsRead: originalMarkAllAsRead,
    clearAllNotifications,
    notificationPreferences,
    updateNotificationPreferences
  } = useNotifications();
  
  const navigate = useNavigate();
  
  const [filter, setFilter] = React.useState("all");
  const [expanded, setExpanded] = React.useState(false);
  const [localNotifications, setLocalNotifications] = useState(notificationHistory);
  const [showSettings, setShowSettings] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<PriorityLevel[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Atualizar notificações locais quando o histórico mudar
  React.useEffect(() => {
    setLocalNotifications(notificationHistory);
  }, [notificationHistory]);

  // Filtrar notificações
  const filteredNotifications = React.useMemo(() => {
    return localNotifications.filter(notification => {
      if (filter === "unread" && notification.isRead) return false;
      if (filter === "read" && !notification.isRead) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(notification.type)) return false;
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(notification.priority)) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [localNotifications, filter, selectedTypes, selectedPriorities, sortBy]);

  const markAsRead = (id: string) => {
    originalMarkAsRead(id);
    setLocalNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    originalMarkAllAsRead();
    setLocalNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const handleClearAll = () => {
    clearAllNotifications();
    setLocalNotifications([]);
    setShowClearConfirm(false);
  };

  return (
    <Sheet open={show} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[400px] p-0">
        <SheetHeader className="px-3 sm:px-4 py-2 sm:py-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-sm sm:text-base md:text-lg">Notificações</SheetTitle>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                onClick={() => setShowClearConfirm(true)}
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="p-2 sm:p-3 border-b">
          <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all" className="text-[10px] sm:text-xs md:text-sm">Todas</TabsTrigger>
              <TabsTrigger value="unread" className="text-[10px] sm:text-xs md:text-sm">Não lidas</TabsTrigger>
              <TabsTrigger value="read" className="text-[10px] sm:text-xs md:text-sm">Lidas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-3 border-b">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 md:h-8 text-xs md:text-sm">
                    <Filter className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Filtros
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel className="text-xs">Tipo</DropdownMenuLabel>
                  <div className="p-2">
                    {["success", "error", "warning", "info", "transaction", "goal", "reminder"].map((type) => (
                      <div key={type} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            setSelectedTypes(prev => 
                              checked 
                                ? [...prev, type]
                                : prev.filter(t => t !== type)
                            );
                          }}
                        />
                        <Label htmlFor={`type-${type}`} className="text-xs capitalize">{type}</Label>
                      </div>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs">Prioridade</DropdownMenuLabel>
                  <div className="p-2">
                    {["high", "medium", "low"].map((priority) => (
                      <div key={priority} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`priority-${priority}`}
                          checked={selectedPriorities.includes(priority as PriorityLevel)}
                          onCheckedChange={(checked) => {
                            setSelectedPriorities(prev => 
                              checked 
                                ? [...prev, priority as PriorityLevel]
                                : prev.filter(p => p !== priority)
                            );
                          }}
                        />
                        <Label htmlFor={`priority-${priority}`} className="text-xs capitalize">{priority}</Label>
                      </div>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Select value={sortBy} onValueChange={(value: "date" | "priority") => setSortBy(value)}>
                <SelectTrigger className="h-7 md:h-8 text-xs md:text-sm">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date" className="text-xs">Data</SelectItem>
                  <SelectItem value="priority" className="text-xs">Prioridade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8"
              onClick={() => setViewMode(prev => prev === "list" ? "grid" : "list")}
            >
              <LayoutGrid className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-2 sm:p-3">
            <AnimatePresence>
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                  <BellOff className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-muted-foreground mb-1.5 sm:mb-2" />
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Nenhuma notificação encontrada</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDismiss={() => {}}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <SheetFooter className="p-2 sm:p-3 border-t">
          <Button
            variant="outline"
            className="w-full text-[10px] sm:text-xs md:text-sm"
            onClick={markAllAsRead}
            disabled={!filteredNotifications.some(n => !n.isRead)}
          >
            <CheckSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-1.5 sm:mr-2" />
            Marcar todas como lidas
          </Button>
        </SheetFooter>

        {/* Dialog de Configurações */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm sm:text-base md:text-lg">Configurações de Notificações</DialogTitle>
              <DialogDescription className="text-[10px] sm:text-xs md:text-sm">
                Personalize como você recebe e visualiza as notificações
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-[10px] sm:text-xs md:text-sm">Tipos de Notificações</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Checkbox
                      id="showTransactionReminders"
                      checked={notificationPreferences.showTransactionReminders}
                      onCheckedChange={(checked) => {
                        updateNotificationPreferences({
                          showTransactionReminders: checked as boolean
                        });
                      }}
                    />
                    <Label htmlFor="showTransactionReminders" className="text-[10px] sm:text-xs">Lembretes de Transações</Label>
                  </div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Checkbox
                      id="showGoalUpdates"
                      checked={notificationPreferences.showGoalUpdates}
                      onCheckedChange={(checked) => {
                        updateNotificationPreferences({
                          showGoalUpdates: checked as boolean
                        });
                      }}
                    />
                    <Label htmlFor="showGoalUpdates" className="text-[10px] sm:text-xs">Atualizações de Metas</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="w-full text-[10px] sm:text-xs md:text-sm"
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Limpeza */}
        <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm sm:text-base md:text-lg">Limpar Notificações</DialogTitle>
              <DialogDescription className="text-[10px] sm:text-xs md:text-sm">
                Tem certeza que deseja limpar todas as notificações? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                className="text-[10px] sm:text-xs md:text-sm"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAll}
                className="text-[10px] sm:text-xs md:text-sm"
              >
                Limpar Tudo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}

export function NotificationButton({ onClick }: { onClick: () => void }) {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="relative h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-[18px] md:w-[18px]" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 p-0 flex items-center justify-center text-[8px] sm:text-[10px] md:text-xs"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
} 