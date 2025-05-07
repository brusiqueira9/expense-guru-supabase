import { supabase } from './supabase';

/**
 * Função para realizar o logout de forma confiável
 * Limpa todos os dados da sessão e redireciona para a página de login
 */
export async function performLogout() {
  try {
    // 1. Limpar todos os tokens e dados de autenticação do localStorage
    localStorage.clear();
    
    // 2. Remover cookies relacionados à autenticação
    document.cookie.split(";").forEach(cookie => {
      const [name] = cookie.trim().split("=");
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // 3. Chamar o método de signOut do Supabase
    await supabase.auth.signOut();
    
    // 4. Redirecionar para a página de autenticação
    window.location.href = '/auth';
    
    return true;
  } catch (error) {
    console.error('Erro durante o processo de logout:', error);
    
    // Mesmo em caso de erro, redirecionar para a página de login
    window.location.href = '/auth';
    
    return false;
  }
} 