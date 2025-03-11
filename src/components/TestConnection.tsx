import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { transactionService, categoryService } from '@/lib/supabaseServices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { TransactionType, TransactionCategory } from '@/types'

export function TestConnection() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, signIn, signUp, signOut } = useAuth()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp(email, password, 'Novo Usuário')
      setMessage('Cadastro realizado! Verifique seu email.')
    } catch (error: any) {
      setMessage(`Erro no cadastro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      setMessage('Login realizado com sucesso!')
    } catch (error: any) {
      setMessage(`Erro no login: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setMessage('Logout realizado com sucesso!')
    } catch (error: any) {
      setMessage(`Erro no logout: ${error.message}`)
    }
  }

  const testDatabase = async () => {
    if (!user) {
      setMessage('Faça login primeiro!')
      return
    }

    try {
      setLoading(true)
      
      // Tenta adicionar uma categoria de teste
      const categoryData = {
        name: 'Categoria Teste',
        description: 'Categoria para testes',
        type: 'expense' as 'income' | 'expense',
        user_id: user.id
      }
      
      await categoryService.add(categoryData)
      
      // Tenta adicionar uma transação de teste
      const transactionData = {
        type: 'expense' as TransactionType,
        amount: 100,
        category: 'Outras Despesas' as TransactionCategory,
        date: new Date().toISOString().split('T')[0],
        description: 'Transação de teste',
        paymentStatus: 'pending' as 'pending' | 'paid',
        user_id: user.id
      }
      
      await transactionService.add(transactionData)

      setMessage('Teste realizado com sucesso! Dados inseridos no banco.')
      toast.success('Teste de banco de dados concluído com sucesso!')
    } catch (error: any) {
      console.error('Erro no teste do banco:', error)
      setMessage(`Erro no teste do banco: ${error.message}`)
      toast.error(`Erro no teste do banco: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Teste de Conexão Supabase</h2>
      
      {user ? (
        <div className="space-y-4">
          <p className="text-green-600">Usuário logado: {user.email}</p>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Sair
          </button>
          <button
            onClick={testDatabase}
            className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
            disabled={loading}
          >
            Testar Banco de Dados
          </button>
        </div>
      ) : (
        <form className="space-y-4">
          <div>
            <label className="block" htmlFor="email">Email:</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full rounded"
              aria-label="Email"
              placeholder="Digite seu email"
            />
          </div>
          <div>
            <label className="block" htmlFor="password">Senha:</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full rounded"
              aria-label="Senha"
              placeholder="Digite sua senha"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Entrar
            </Button>
            <Button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Cadastrar
            </Button>
          </div>
        </form>
      )}
      
      {message && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p>{message}</p>
        </div>
      )}
    </div>
  )
} 