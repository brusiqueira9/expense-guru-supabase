
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, ArrowRight, Lock, Mail, CheckCircle2 } from "lucide-react";
import Logo from "@/components/Logo";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
import BackgroundAnimation from "@/components/BackgroundAnimation";

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isInputFocused, setIsInputFocused] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setLoginSuccess(true);
    
    // Reset success state after animation
    setTimeout(() => {
      setLoginSuccess(false);
      toast({
        title: isLogin ? "Login realizado" : "Conta criada",
        description: isLogin 
          ? "Bem-vindo de volta!" 
          : "Sua conta foi criada com sucesso!",
        duration: 3000,
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <BackgroundAnimation />
      
      <div className="relative w-full max-w-md animate-float z-10">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-20 animate-pulse-slow">
          <Logo />
        </div>
        
        <Card className={`neomorphic p-8 pt-16 transition-all duration-500 ${loginSuccess ? 'scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)]' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-wide mb-2 transition-all duration-300 hover:tracking-wider">
                {isLogin ? "Bem-vindo de volta" : "Criar nova conta"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin 
                  ? "Entre com sua conta para continuar" 
                  : "Preencha os dados abaixo para começar"}
              </p>
            </div>
            
            {loginSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 animate-scale-in">
                <CheckCircle2 className="w-16 h-16 text-black mb-4 animate-pulse-slow" />
                <p className="text-xl font-medium">{isLogin ? "Login bem-sucedido!" : "Conta criada!"}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`space-y-2 relative transition-all duration-300 ${isInputFocused === 'email' ? 'scale-105' : ''}`}>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
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
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ease-in-out ${isInputFocused === 'password' ? 'w-full' : 'w-0'}`}></div>
                  </div>
                  {!isLogin && <PasswordStrengthIndicator password={password} />}
                </div>
              </div>
            )}
            
            {!loginSuccess && (
              <>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white hover:bg-gray-800 transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? 'Processando...' : isLogin ? "Entrar" : "Criar conta"}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setEmail("");
                      setPassword("");
                    }}
                    className="text-sm text-gray-600 hover:text-black transition-colors hover:underline"
                  >
                    {isLogin 
                      ? "Não tem uma conta? Criar agora" 
                      : "Já tem uma conta? Fazer login"}
                  </button>
                </div>
              </>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Index;
