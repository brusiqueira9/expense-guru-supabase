import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Obtém a sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      if (signUpError) throw signUpError;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    session,
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };
} 