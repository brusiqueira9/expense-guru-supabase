import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { WavePattern, SparklesCore } from './ui/icons';
import { Loader2 } from 'lucide-react';
import logo from '@/assets/logo.svg';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const navigate = useNavigate();
  const { signIn, session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setMessage(null);

      await signIn(email, password);

      setMessage({
        text: 'Login realizado com sucesso!',
        type: 'success'
      });
      
    } catch (error: any) {
      setMessage({
        text: error.message,
        type: 'error'
      });
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Padrões de fundo */}
      <div className="absolute inset-0 w-full h-full">
        <WavePattern />
        <SparklesCore />
      </div>

      {/* Container principal */}
      <div className="relative w-full max-w-md px-4">
        <Card className="w-full backdrop-blur-sm bg-card/95 shadow-2xl">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/60 blur" />
                <div className="relative bg-card rounded-full p-2">
                  <img src={logo} alt="Expense Guru Logo" className="h-12 w-12" />
                </div>
              </div>
            </div>
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Expense Guru
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Entre com suas credenciais para acessar
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="bg-background/50"
                />
              </div>

              {message && (
                <div 
                  className={`p-3 rounded-lg text-sm ${
                    message.type === 'error' 
                      ? 'bg-destructive/10 text-destructive' 
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <a href="#" className="text-primary hover:underline">
                  Cadastre-se
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 