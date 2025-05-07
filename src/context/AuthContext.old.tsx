import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// Interface que define o tipo do contexto de autenticação
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Criando o contexto com valor default
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

// Criando o hook useAuth
export function useAuth() {
  return useContext(AuthContext);
}

// Componente Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Efeito para inicializar e monitorar o estado de autenticação
  useEffect(() => {
    // Função para obter a sessão atual
    const getSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error.message);
          throw error;
        }
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Erro ao inicializar a autenticação:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    // Obter a sessão inicial
    getSession();

    // Configurar o listener para mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Evento de autenticação:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    // Limpeza quando o componente desmontar
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Erro ao fazer login:', error.message);
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  // Função de registro
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        console.error('Erro ao criar conta:', error.message);
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error.message);
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  // Objeto com todos os valores do contexto
  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  // Retorna o provider com o valor do contexto
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="p-6 max-w-sm mx-auto bg-card rounded-xl shadow-md">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
} 