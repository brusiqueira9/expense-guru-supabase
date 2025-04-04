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
import { NotificationCenter } from "@/components/NotificationCenter";
import { useState, useEffect } from "react";

export function UserNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showTips, setShowTips] = useState(true);

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

  return (
    <div className="flex items-center gap-4">
      {/* Centro de Notificações */}
      <NotificationCenter />
      
      {/* Configurações */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/settings")}
        title="Configurações"
      >
        <Settings className="h-5 w-5" />
      </Button>
      
      {/* Ajuda */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))}
        title="Atalhos de Teclado"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
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