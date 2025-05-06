import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, HelpCircle, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { NotificationCenter, NotificationButton } from "@/components/NotificationCenter";
import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button as UiButton } from "@/components/ui/button";

export function UserNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showTips, setShowTips] = useState(true);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const { notificationHistory, unreadCount } = useNotifications();
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  // Carregar preferência de dicas do localStorage
  useEffect(() => {
    if (user?.id) {
      const storedPreferences = localStorage.getItem(`tips_preferences:${user.id}`);
      if (storedPreferences) {
        const preferences = JSON.parse(storedPreferences);
        setShowTips(preferences.showTips);
      }
    }
  }, [user?.id]);

  // Atualizar preferência de dicas no localStorage
  const toggleTips = () => {
    if (user?.id) {
      const newShowTips = !showTips;
      setShowTips(newShowTips);
      
      const storedPreferences = localStorage.getItem(`tips_preferences:${user.id}`);
      const preferences = storedPreferences ? JSON.parse(storedPreferences) : {
        showTips: true,
        showTour: true,
        tipFrequency: 'medium'
      };
      
      preferences.showTips = newShowTips;
      localStorage.setItem(`tips_preferences:${user.id}`, JSON.stringify(preferences));
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  // Lista de atalhos do sistema
  const shortcuts = [
    { key: 'h', description: 'Ir para Dashboard' },
    { key: 't', description: 'Ir para Transações' },
    { key: 'c', description: 'Ir para Categorias' },
    { key: 'r', description: 'Ir para Relatórios' },
    { key: 's', description: 'Ir para Configurações' },
    { key: 'n', description: 'Nova Transação' },
    { key: '?', description: 'Mostrar Ajuda' },
    { key: 'Escape', description: 'Fechar pop-ups' }
  ];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
      {/* Notificações */}
      <div className="relative z-10">
        <NotificationButton onClick={() => setShowNotificationCenter(true)} />
        <NotificationCenter 
          show={showNotificationCenter} 
          onClose={() => setShowNotificationCenter(false)} 
        />
      </div>
      
      {/* Configurações */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/settings")}
        title="Configurações"
        className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-[18px] md:w-[18px]" />
      </Button>
      
      {/* Ajuda - Atalhos de teclado */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowHelpDialog(true)}
        title="Atalhos de Teclado"
        className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-[18px] md:w-[18px]" />
      </Button>
      
      {/* Menu do Usuário */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full transition-colors hover:bg-muted p-0 overflow-hidden">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || ""} />
              <AvatarFallback>
                {user?.email ? user.email.substring(0, 2).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none truncate">{user?.user_metadata?.name || user?.email}</p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem
              checked={showTips}
              onCheckedChange={toggleTips}
            >
              <div className="flex items-center">
                {showTips ? (
                  <Eye className="mr-2 h-4 w-4" />
                ) : (
                  <EyeOff className="mr-2 h-4 w-4" />
                )}
                <span>{showTips ? "Dicas Ativadas" : "Dicas Desativadas"}</span>
              </div>
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Ajuda com Atalhos */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Atalhos de Teclado</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Use estes atalhos para navegar mais rapidamente pelo sistema
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-4">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-xs md:text-sm">{shortcut.description}</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-background rounded-md border">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowHelpDialog(false)}
              className="w-full text-xs md:text-sm"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 