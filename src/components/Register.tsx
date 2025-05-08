import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Eye, EyeOff, ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';
import LoginLogo from './LoginLogo';
import { motion } from 'framer-motion';
import BackgroundAnimation from './BackgroundAnimation';
import { useNotifications } from '../hooks/useNotifications';
import { LoadingButton } from './ui/loading-button';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [shake, setShake] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  const { signUp, session } = useAuth();
  const { addNotification } = useNotifications();

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

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    let isValid = true;

    // Validação do nome
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      isValid = false;
    } else if (name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
      isValid = false;
    }

    // Validação do email
    if (!email) {
      newErrors.email = 'Email é obrigatório';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Email inválido';
        isValid = false;
      }
    }

    // Validação da senha
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
      isValid = false;
    } else {
      const passwordErrors: string[] = [];
      
      if (password.length < 8) {
        passwordErrors.push('Pelo menos 8 caracteres');
      }
      if (!/[A-Z]/.test(password)) {
        passwordErrors.push('Pelo menos uma letra maiúscula');
      }
      if (!/[a-z]/.test(password)) {
        passwordErrors.push('Pelo menos uma letra minúscula');
      }
      if (!/\d/.test(password)) {
        passwordErrors.push('Pelo menos um número');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        passwordErrors.push('Pelo menos um caractere especial');
      }

      if (passwordErrors.length > 0) {
        newErrors.password = `A senha deve conter: ${passwordErrors.join(', ')}`;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;

    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      await signUp(email, password, name);
      addNotification({
        title: 'Conta criada',
        message: 'Verifique seu email para confirmar o cadastro',
        type: 'success'
      });
      navigate('/auth');
    } catch (error: any) {
      console.error('Erro no registro:', error);
      let errorMessage = 'Ocorreu um erro ao criar sua conta';
      let fieldError = '';
      
      if (error.message.includes('already registered')) {
        errorMessage = 'Este email já está cadastrado';
        fieldError = 'email';
      } else if (error.message.includes('weak password')) {
        errorMessage = 'A senha é muito fraca. Use uma combinação de letras, números e símbolos';
        fieldError = 'password';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Muitas tentativas de registro. Por favor, aguarde alguns minutos';
        setCooldown(60);
      }

      if (fieldError) {
        setErrors(prev => ({ ...prev, [fieldError]: errorMessage }));
      }

      setShake(true);
      setTimeout(() => setShake(false), 500);

      addNotification({
        title: 'Erro no cadastro',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || cooldown > 0;
  const buttonText = loading 
    ? 'Criando conta...' 
    : cooldown > 0 
    ? `Aguarde ${cooldown}s` 
    : 'Criar conta';

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <BackgroundAnimation />
      
      <motion.div 
        className="relative w-full max-w-md animate-float z-10"
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Card className="neomorphic p-8">
          <div className="flex flex-col items-center justify-center mb-6">
            <LoginLogo />
          </div>
          
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
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) {
                        setErrors(prev => ({ ...prev, name: undefined }));
                      }
                    }}
                    className={`animate-text-focus pl-3 pr-3 backdrop-blur-sm bg-transparent transition-all duration-300 ${
                      errors.name 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-400 focus:border-black'
                    }`}
                    required
                    onFocus={() => setIsInputFocused('name')}
                    onBlur={() => setIsInputFocused(null)}
                  />
                  {errors.name && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  )}
                  <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-in-out ${
                    errors.name 
                      ? 'bg-red-500 w-full' 
                      : isInputFocused === 'name' 
                        ? 'bg-black w-full' 
                        : 'bg-black w-0'
                  }`}></div>
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                    className={`animate-text-focus pl-3 pr-3 backdrop-blur-sm bg-transparent transition-all duration-300 ${
                      errors.email 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-400 focus:border-black'
                    }`}
                    required
                    onFocus={() => setIsInputFocused('email')}
                    onBlur={() => setIsInputFocused(null)}
                  />
                  {errors.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  )}
                  <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-in-out ${
                    errors.email 
                      ? 'bg-red-500 w-full' 
                      : isInputFocused === 'email' 
                        ? 'bg-black w-full' 
                        : 'bg-black w-0'
                  }`}></div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: undefined }));
                      }
                    }}
                    className={`animate-text-focus pl-3 pr-10 backdrop-blur-sm bg-transparent transition-all duration-300 ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-400 focus:border-black'
                    }`}
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
                  {errors.password && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 text-red-500">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  )}
                  <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-in-out ${
                    errors.password 
                      ? 'bg-red-500 w-full' 
                      : isInputFocused === 'password' 
                        ? 'bg-black w-full' 
                        : 'bg-black w-0'
                  }`}></div>
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>
                <PasswordStrengthIndicator password={password} />
              </div>
            </div>

            <LoadingButton
              type="submit"
              loading={loading}
              loadingText={buttonText}
              disabled={isButtonDisabled}
              className="w-full bg-black text-white hover:bg-gray-800 transition-all duration-300 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {buttonText}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </LoadingButton>

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
      </motion.div>
    </div>
  );
} 