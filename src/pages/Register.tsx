import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, ArrowRight, Lock, Mail, User, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import { toast } from 'sonner';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  const { signUp, session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;

    try {
      setLoading(true);
      await signUp(email, password, name);
      toast.success('Conta criada com sucesso! Você já pode fazer login.');
      navigate('/auth');
    } catch (error: any) {
      console.error('Erro no registro:', error);
      if (error.message.includes('security purposes')) {
        const seconds = parseInt(error.message.match(/\d+/)[0]);
        setCooldown(seconds);
        toast.error(`Por favor, aguarde ${seconds} segundos antes de tentar novamente.`);
      } else if (error.message.includes('already registered')) {
        toast.error('Este email já está registrado. Por favor, faça login.');
      } else {
        toast.error('Erro ao criar conta. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || cooldown > 0;
  const buttonText = loading 
    ? 'Processando...' 
    : cooldown > 0 
    ? `Aguarde ${cooldown}s` 
    : 'Criar conta';

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

            <Button
              type="submit"
              disabled={isButtonDisabled}
              className={`w-full text-white transition-all duration-300 group relative overflow-hidden ${
                isButtonDisabled 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {buttonText}
                {!isButtonDisabled && (
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                )}
              </span>
              {!isButtonDisabled && (
                <span className="absolute inset-0 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/auth')}
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