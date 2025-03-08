import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    // Carregar tema inicial baseado na preferência do sistema
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const root = window.document.documentElement;
    
    if (isDarkMode) {
      root.classList.add("dark");
    }

    // Se o usuário estiver logado, buscar suas preferências
    if (user?.id) {
      supabase
        .from('user_preferences')
        .select('dark_mode')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            if (data.dark_mode) {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }
          }
        });
    }

    // Observar mudanças na preferência do sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!user?.id) { // Só aplicar se não houver usuário logado
        if (e.matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [user?.id]);

  return children;
} 