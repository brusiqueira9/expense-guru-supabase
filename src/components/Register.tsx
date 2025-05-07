import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Eye, EyeOff, ArrowRight, Lock, Mail, User } from 'lucide-react';
import Logo from './Logo';
import BackgroundAnimation from './BackgroundAnimation';
import { LoadingButton } from './ui/loading-button';
import { useNotifications } from '../hooks/useNotifications';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signUp, session } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validações básicas
    if (!name) {
      addNotification({
        title: 'Campo obrigatório',
        message: 'Por favor, informe seu nome',
        type: 'error'
      });
      return;
    }

    if (!email) {
      addNotification({
        title: 'Campo obrigatório',
        message: 'Por favor, informe seu email',
        type: 'error'
      });
      return;
    }

    if (!password) {
      addNotification({
        title: 'Campo obrigatório',
        message: 'Por favor, informe sua senha',
        type: 'error'
      });
      return;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addNotification({
        title: 'Email inválido',
        message: 'Por favor, informe um email válido',
        type: 'error'
      });
      return;
    }

    // Validação de senha
    if (password.length < 6) {
      addNotification({
        title: 'Senha inválida',
        message: 'A senha deve ter pelo menos 6 caracteres',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, name);
      addNotification({
        title: 'Conta criada',
        message: 'Verifique seu email para confirmar o cadastro',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Erro no registro:', error);
      let errorMessage = 'Ocorreu um erro ao criar sua conta';
      
      // Tratamento de erros específicos do Supabase
      if (error.message.includes('already registered')) {
        errorMessage = 'Este email já está cadastrado';
      } else if (error.message.includes('weak password')) {
        errorMessage = 'A senha é muito fraca. Use uma combinação de letras, números e símbolos';
      }

      addNotification({
        title: 'Erro no cadastro',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <BackgroundAnimation />
      
      <div className="relative w-full max-w-md animate-float z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 z-20 animate-pulse-slow scale-150">
          <Logo />
        </div>
        
        <Card className="neomorphic p-8 pt-24">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-wide mb-2 transition-all duration-300 hover:tracking-wider">
                Criar nova conta
              </h1>
              <p className="text-sm text-muted-foreground">
                Preencha os dados abaixo para começar
              </p>
            </div>
            
            <div className="space-y-6">
              <div className={`space-y-2 relative transition-all duration-300 ${isInputFocused === 'name' ? 'scale-105' : ''}`}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Nome
                </div>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="animate-text-focus pl-3 pr-3 backdrop-blur-sm bg-transparent border-gray-400 focus:border-black transition-all duration-300"
                    required
                    onFocus={() => setIsInputFocused('name')}
                    onBlur={() => setIsInputFocused(null)}
                  />
                  <div className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ease-in-out ${isInputFocused === 'name' ? 'w-full' : 'w-0'}`}></div>
                </div>
              </div>

              <div className={`space-y-2 relative transition-all duration-300 ${isInputFocused === 'email' ? 'scale-105' : ''}`}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="animate-text-focus pl-3 pr-3 backdrop-blur-sm bg-transparent border-gray-400 focus:border-black transition-all duration-300"
                    required
                    onFocus={() => setIsInputFocused('email')}
                    onBlur={() => setIsInputFocused(null)}
                  />
                  <div className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ease-in-out ${isInputFocused === 'email' ? 'w-full' : 'w-0'}`}></div>
                </div>
              </div>

              <div className={`space-y-2 relative transition-all duration-300 ${isInputFocused === 'password' ? 'scale-105' : ''}`}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="h-4 w-4" />
                  Senha
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="animate-text-focus pl-3 pr-10 backdrop-blur-sm bg-transparent border-gray-400 focus:border-black transition-all duration-300"
                    required
                    onFocus={() => setIsInputFocused('password')}
                    onBlur={() => setIsInputFocused(null)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <div className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ease-in-out ${isInputFocused === 'password' ? 'w-full' : 'w-0'}`}></div>
                </div>
              </div>
            </div>

            <LoadingButton
              type="submit"
              loading={loading}
              loadingText="Criando conta..."
              className="w-full bg-black text-white hover:bg-gray-800 transition-all duration-300 group relative overflow-hidden"
            >
              Criar conta
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </LoadingButton>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-black transition-colors hover:underline"
              >
                Já tem uma conta? Fazer login
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 