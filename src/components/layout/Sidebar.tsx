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
import logo from "@/assets/money.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

export function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
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

  return (
    <div className="flex h-full w-72 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <img src={logo} alt="Expense Guru Logo" className="h-8 w-8" />
        <div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
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
                <span className="absolute left-0 -translate-x-full rounded-r-lg bg-primary px-2 py-1 text-xs text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {item.description}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="truncate">Sair</span>
        </button>
      </div>
    </div>
  );
} 