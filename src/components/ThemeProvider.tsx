import React, { useEffect, useState } from "react";
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
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    // Adicionar classe de transição ao documento
    document.documentElement.classList.add('theme-transition');
    
    // Função para remover a classe de transição temporariamente durante mudanças de tema
    const handleThemeChange = () => {
      document.documentElement.classList.remove('theme-transition');
      window.setTimeout(() => {
        document.documentElement.classList.add('theme-transition');
      }, 500); // Aumentado para uma transição mais suave
    };
    
    // Observar mudanças de tema
    window.addEventListener('themeChange', handleThemeChange);
    
    // Injetar estilos CSS para transições suaves
    const style = document.createElement('style');
    style.textContent = `
      .theme-transition * {
        transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease !important;
      }
      
      /* Melhorias de cores para dark mode */
      .dark {
        --background: 222 47% 4%;
        --foreground: 210 40% 98%;
        --card: 222 47% 6%;
        --card-foreground: 210 40% 98%;
        --popover: 222 47% 6%;
        --popover-foreground: 210 40% 98%;
        --primary: 217 91.2% 59.8%;
        --primary-foreground: 222 47% 1%;
        --secondary: 217 32.6% 17.5%;
        --secondary-foreground: 210 40% 98%;
        --muted: 217 32.6% 12%;
        --muted-foreground: 215 20.2% 65.1%;
        --accent: 217 32.6% 17.5%;
        --accent-foreground: 210 40% 98%;
        --destructive: 0 62.8% 50.6%;
        --destructive-foreground: 210 40% 98%;
        --border: 217 32.6% 17.5%;
        --input: 217 32.6% 17.5%;
        --ring: 224.3 76.3% 48%;
      }
      
      /* Estilo para scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: var(--background);
        border-radius: 4px;
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
      
      /* Melhoria nas sombras do dark mode */
      .dark .shadow-md,
      .dark .shadow-lg,
      .dark .shadow-xl {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
      }
      
      /* Melhores contrastes para gráficos e elementos visuais */
      .dark .text-muted-foreground {
        color: hsl(215 20.2% 75.1%) !important;
      }
    `;
    document.head.appendChild(style);

    // Carregar tema inicial baseado na preferência do sistema
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const root = window.document.documentElement;
    
    // Tentar recuperar do localStorage primeiro para evitar flash
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      root.classList.add("dark");
    } else if (storedTheme === 'light') {
      root.classList.remove("dark");
    }
    
    // Função para carregar as preferências do usuário
    const loadUserPreferences = async () => {
      // Definir um timeout para garantir que tentamos carregar pelo menos uma vez
      const timeoutId = setTimeout(() => {
        setThemeLoaded(true);
      }, 2000);
      
      try {
        if (user?.id) {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('dark_mode')
            .eq('user_id', user.id)
            .single();
          
          if (error) throw error;
          
          if (data && data.dark_mode !== undefined) {
            // Salvar no localStorage para carregamento rápido em acessos futuros
            localStorage.setItem('theme', data.dark_mode ? 'dark' : 'light');
            
            if (data.dark_mode) {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }
            
            // Disparar evento de mudança de tema
            window.dispatchEvent(new Event('themeChange'));
          } else {
            // Se não houver preferência do usuário, use a preferência do sistema
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            
            if (isDarkMode) {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }
          }
        } else {
          // Para usuários não logados, use a preferência do sistema se não houver localStorage
          if (!storedTheme) {
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            
            if (isDarkMode) {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }
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
      } finally {
        clearTimeout(timeoutId);
        setThemeLoaded(true);
      }
    };
    
    loadUserPreferences();
    
    // Detectar mudanças na preferência do sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!user?.id) { // Apenas para usuários não logados
        if (e.matches) {
          root.classList.add("dark");
          localStorage.setItem('theme', 'dark');
        } else {
          root.classList.remove("dark");
          localStorage.setItem('theme', 'light');
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