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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, HelpCircle, LightbulbIcon, Eye, EyeOff } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Button as UiButton } from "@/components/ui/button";

export function UserNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showTips, setShowTips] = useState(true);
  const { createTestNotification } = useNotifications();
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
      
      // Carregar preferências atuais
      const storedPreferences = localStorage.getItem(`tips_preferences:${user.id}`);
      const preferences = storedPreferences ? JSON.parse(storedPreferences) : {
        showTips: true,
        showTour: true,
        tipFrequency: 'medium'
      };
      
      // Atualizar e salvar
      preferences.showTips = newShowTips;
      localStorage.setItem(`tips_preferences:${user.id}`, JSON.stringify(preferences));
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  // Função para mostrar os atalhos - implementação totalmente independente
  const showKeyboardShortcuts = () => {
    // Lista direta de atalhos
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
    
    // Solução correta usando o toast.message da biblioteca Sonner
    toast.message(
      <div>
        <h3 className="text-lg font-semibold mb-3 text-center border-b pb-2">Atalhos de Teclado</h3>
        <div className="mt-2 space-y-2 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
              <kbd className="px-3 py-1.5 text-sm font-semibold bg-muted rounded-md shadow-sm border border-gray-300">
                {shortcut.key}
              </kbd>
              <span className="ml-4 text-sm font-medium">{shortcut.description}</span>
            </div>
          ))}
          <div className="mt-3 pt-2 text-xs text-center text-muted-foreground">
            Pressione <kbd className="px-1.5 py-0.5 rounded border border-gray-300 bg-muted text-xs">?</kbd> a qualquer momento
          </div>
        </div>
      </div>,
      {
        duration: 10000,
        position: "top-center",
        className: "keyboard-shortcuts-toast w-[400px] max-w-[95vw]",
      }
    );
  };

  return (
    <div className="flex items-center gap-3">
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
        className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Settings className="h-[18px] w-[18px]" />
      </Button>
      
      {/* Ajuda - Atalhos de teclado */}
      <Button
        variant="ghost"
        size="icon"
        onClick={showKeyboardShortcuts}
        title="Atalhos de Teclado"
        className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <HelpCircle className="h-[18px] w-[18px]" />
      </Button>
      
      {/* Menu do usuário */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full transition-colors hover:bg-muted p-0 overflow-hidden">
            <Avatar className="h-9 w-9">
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
              <p className="text-sm font-medium leading-none">{user?.user_metadata?.name || user?.email}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
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
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 