import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performLogout } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        await performLogout();
      } catch (error) {
        console.error('Erro no logout automático:', error);
        // Tentar redirecionar via navigate se o performLogout falhar
        navigate('/auth');
      }
    };

    // Executar o logout assim que o componente montar
    logout();

    // Fallback: se após 2 segundos não tiver redirecionado, forçar redirecionamento
    const timeoutId = setTimeout(() => {
      window.location.href = '/auth';
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-xl font-medium mb-2">Saindo...</h1>
        <p className="text-sm text-muted-foreground">Aguarde enquanto encerramos sua sessão</p>
      </div>
    </div>
  );
} 