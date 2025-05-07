import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  FileText,
  Target,
  Settings,
  LogOut,
  Tags,
  CreditCard,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoPreta from "/icons/logopreta.png";
import logoBranca from "/icons/logobranca.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { performLogout } from "@/lib/auth";

const navigation = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: LayoutDashboard,
    description: "Visão geral das suas finanças"
  },
  { 
    name: "Transações", 
    href: "/transactions", 
    icon: Receipt,
    description: "Gerencie suas receitas e despesas"
  },
  { 
    name: "Categorias", 
    href: "/categories", 
    icon: Tags,
    description: "Organize suas transações"
  },
  { 
    name: "Contas", 
    href: "/accounts", 
    icon: CreditCard,
    description: "Gerencie suas contas bancárias"
  },
  { 
    name: "Carteiras", 
    href: "/wallets", 
    icon: Wallet,
    description: "Controle seus investimentos"
  },
  { 
    name: "Gráficos", 
    href: "/charts", 
    icon: BarChart3,
    description: "Análise visual dos seus gastos"
  },
  { 
    name: "Relatórios", 
    href: "/reports", 
    icon: FileText,
    description: "Relatórios detalhados"
  },
  { 
    name: "Metas", 
    href: "/goals", 
    icon: Target,
    description: "Defina e acompanhe objetivos"
  },
  { 
    name: "Configurações", 
    href: "/settings", 
    icon: Settings,
    description: "Ajuste suas preferências"
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirecionar para a página de login após o logout
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
        .split(" ")
        .map(part => part[0]?.toUpperCase())
        .slice(0, 2)
        .join("");
    }
    if (!user?.email) return "?";
    return user.email
      .split("@")[0]
      .split(".")
      .map(part => part[0]?.toUpperCase())
      .join("");
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    return user?.email || "Usuário";
  };

  const handleNavigation = (href: string) => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex h-full w-full flex-col border-r bg-card">
      <div className="flex h-24 items-center gap-3 border-b px-6">
        <div className="relative flex items-center">
          <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center overflow-hidden dark:bg-white/5">
            {/* Logo para modo claro (escondida no modo escuro) */}
            <img 
              src={logoPreta} 
              alt="Expense Guru Logo" 
              className="w-12 h-12 object-contain block dark:hidden" 
            />
            
            {/* Logo para modo escuro (escondida no modo claro) */}
            <img 
              src={logoBranca} 
              alt="Expense Guru Logo" 
              className="w-12 h-12 object-contain hidden dark:block" 
            />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Expense Guru
          </h1>
          <p className="text-xs text-muted-foreground">Controle Financeiro</p>
        </div>
      </div>

      {user && (
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-medium truncate max-w-[160px]">{getUserDisplayName()}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <nav className="space-y-1.5 p-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative group",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={item.description}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.name}</span>
                <span className="absolute left-0 -translate-x-full rounded-r-lg bg-primary px-2 py-1 text-xs text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 hidden md:block">
                  {item.description}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-3">
        <a
          href="/logout"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="truncate">Sair</span>
        </a>
      </div>
    </div>
  );
} 