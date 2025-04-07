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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mb-3"
    >
      <Card 
        className={`overflow-hidden transition-all duration-200 ${
          notification.isRead ? 'bg-background opacity-70 hover:opacity-90' : priorityColors[notification.priority]
        } hover:shadow-md border`}
      >
        <CardHeader className="py-3 px-4 pb-2">
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-center">
              <div className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                {typeIcons[notification.type]}
              </div>
              <div>
                <CardTitle className="text-sm font-medium flex items-center">
                  {notification.title}
                  {notification.priority === 'high' && !notification.isRead && (
                    <Badge variant="destructive" className="ml-2 text-[10px] h-4 px-1.5">Urgente</Badge>
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
            <div className="flex gap-1">
              {!notification.isRead && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full hover:bg-background/80"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-1 px-4">
          <p className="text-sm whitespace-pre-line leading-relaxed">{notification.message}</p>
        </CardContent>
        {(notification.actionLabel || !notification.isRead) && (
          <CardFooter className="py-2 px-4 flex justify-end gap-2 bg-background/40 backdrop-blur-sm">
            {notification.actionLabel && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="text-xs h-7 px-3 rounded-full"
                onClick={() => {
                  onMarkAsRead(notification.id);
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
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
                className="text-xs h-7 px-3 rounded-full"
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
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    notificationPreferences,
    updateNotificationPreferences
  } = useNotifications();
  
  const navigate = useNavigate();
  
  const [filter, setFilter] = React.useState("all");
  const [expanded, setExpanded] = React.useState(false);
  
  // Filtrar notificações
  const filteredNotifications = React.useMemo(() => {
    if (filter === "all") return notificationHistory;
    if (filter === "unread") return notificationHistory.filter(n => !n.isRead);
    if (filter === "read") return notificationHistory.filter(n => n.isRead);
    if (filter === "high") return notificationHistory.filter(n => n.priority === "high");
    return notificationHistory;
  }, [notificationHistory, filter]);
  
  if (!show) return null;
  
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-primary" />
            Centro de Notificações
          </DialogTitle>
          <DialogDescription>
            Visualize e gerencie suas notificações importantes
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="all" className="w-full mb-2">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all" onClick={() => setFilter("all")}>Todas</TabsTrigger>
            <TabsTrigger value="unread" onClick={() => setFilter("unread")}>Não lidas</TabsTrigger>
            <TabsTrigger value="high" onClick={() => setFilter("high")}>Urgentes</TabsTrigger>
            <TabsTrigger value="read" onClick={() => setFilter("read")}>Lidas</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-muted-foreground">
            {filter === "all" ? "Todas as notificações" : 
             filter === "unread" ? "Notificações não lidas" :
             filter === "high" ? "Notificações urgentes" : "Notificações lidas"}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full"
              title="Marcar todas como lidas"
              onClick={markAllAsRead}
              disabled={!notificationHistory.some(n => !n.isRead)}
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full"
              title="Limpar todas as notificações"
              onClick={clearAllNotifications}
              disabled={notificationHistory.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="max-h-[350px] pr-2 -mr-2">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 px-4"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <BellOff className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Sem notificações</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {filter === "all" ? "Você não tem notificações no momento." : 
                   filter === "unread" ? "Todas as notificações foram lidas." :
                   filter === "high" ? "Não há notificações urgentes." : "Nenhuma notificação lida."}
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDismiss={(id) => markAsRead(id)}
                />
              ))
            )}
          </AnimatePresence>
        </ScrollArea>
        
        <div className="flex justify-between items-center border-t pt-3 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-muted-foreground flex items-center"
            onClick={() => {
              navigate('/settings');
              onClose();
            }}
          >
            <Settings className="h-4 w-4 mr-1" />
            Configurações
          </Button>
          <Button onClick={onClose} className="px-4">Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function NotificationButton({ onClick }: { onClick: () => void }) {
  const { notificationHistory } = useNotifications();
  const unreadCount = notificationHistory.filter(n => !n.isRead).length;
  const hasHighPriority = notificationHistory.some(n => !n.isRead && n.priority === 'high');

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={hasHighPriority ? { 
        scale: [1, 1.1, 1],
        transition: { 
          repeat: Infinity, 
          repeatType: "reverse",
          duration: 1.5
        }
      } : {}}
    >
      <Button
        variant={unreadCount > 0 ? "default" : "secondary"}
        size="icon"
        className={`relative shadow-md ${
          hasHighPriority 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : unreadCount > 0 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        } rounded-full h-9 w-9 transition-all duration-200`}
        onClick={onClick}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute -top-1 -right-1 ${
              hasHighPriority ? 'bg-red-600' : 'bg-red-500'
            } text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-background`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>
    </motion.div>
  );
} 