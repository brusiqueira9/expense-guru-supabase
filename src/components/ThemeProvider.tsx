import React, { useEffect } from "react";
import { createContext, useContext } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
}

type ThemeProviderState = {
  theme: string
  setTheme: (theme: string) => void
  resolvedTheme?: string
  systemTheme?: string
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const { user } = useAuth();

  useEffect(() => {
    // Adicionar classe de transição ao documento
    document.documentElement.classList.add('theme-transition');
    
    // Função para remover a classe de transição temporariamente durante mudanças de tema
    const handleThemeChange = () => {
      document.documentElement.classList.remove('theme-transition');
      window.setTimeout(() => {
        document.documentElement.classList.add('theme-transition');
      }, 300);
    };
    
    // Observar mudanças de tema
    window.addEventListener('themeChange', handleThemeChange);
    
    // Injetar estilos CSS para transições suaves
    const style = document.createElement('style');
    style.textContent = `
      .theme-transition * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
      }
      
      /* Melhorias de cores para dark mode */
      .dark {
        --background: 240 10% 3.9%;
        --foreground: 0 0% 98%;
        --card: 240 10% 5.9%;
        --card-foreground: 0 0% 98%;
        --popover: 240 10% 5.9%;
        --popover-foreground: 0 0% 98%;
        --muted: 240 5% 15.9%;
        --muted-foreground: 240 5% 64.9%;
        --border: 240 5% 15%;
      }
      
      /* Estilo para scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: var(--background);
      }
      
      ::-webkit-scrollbar-thumb {
        background: hsl(var(--muted));
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: hsl(var(--muted-foreground));
      }
      
      .dark ::-webkit-scrollbar-thumb {
        background: hsl(var(--muted));
      }
      
      .dark ::-webkit-scrollbar-thumb:hover {
        background: hsl(var(--muted-foreground));
      }
    `;
    document.head.appendChild(style);

    // Carregar tema inicial baseado na preferência do sistema
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const root = window.document.documentElement;
    
    // Função para carregar as preferências do usuário
    const loadUserPreferences = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('dark_mode')
            .eq('user_id', user.id)
            .single();
          
          if (error) throw error;
          
          if (data && data.dark_mode !== undefined) {
            if (data.dark_mode) {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }
            
            // Disparar evento de mudança de tema
            window.dispatchEvent(new Event('themeChange'));
          } else {
            // Se não houver preferência do usuário, use a preferência do sistema
            if (isDarkMode) {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }
          }
        } catch (error) {
          console.error("Erro ao carregar preferências:", error);
          
          // Fallback para a preferência do sistema
          if (isDarkMode) {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }
        }
      } else {
        // Para usuários não logados, use a preferência do sistema
        if (isDarkMode) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    };
    
    loadUserPreferences();
    
    // Detectar mudanças na preferência do sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!user?.id) { // Apenas para usuários não logados
        if (e.matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
        
        // Disparar evento de mudança de tema
        window.dispatchEvent(new Event('themeChange'));
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      document.head.removeChild(style);
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [user?.id]);

  return (
    <NextThemesProvider
      {...props}
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      enableColorScheme
      enableSystem
      attribute="class"
    >
      {children}
    </NextThemesProvider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
} 