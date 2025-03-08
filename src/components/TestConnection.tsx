import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabaseHelper } from '../lib/supabase'

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
      await signUp(email, password)
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
      // Tenta adicionar uma categoria de teste
      const category = await supabaseHelper.categories.add({
        name: 'Categoria Teste',
        user_id: user.id
      })
      
      // Tenta adicionar uma despesa de teste
      const expense = await supabaseHelper.expenses.add({
        description: 'Despesa Teste',
        amount: 100,
        category: 'Categoria Teste',
        date: new Date().toISOString().split('T')[0],
        user_id: user.id
      })

      setMessage('Teste realizado com sucesso! Dados inseridos no banco.')
    } catch (error: any) {
      setMessage(`Erro no teste do banco: ${error.message}`)
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
            <input
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full rounded"
              aria-label="Senha"
              placeholder="Digite sua senha"
            />
          </div>
          <div className="space-x-2">
            <button
              onClick={handleSignUp}
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              Cadastrar
            </button>
            <button
              onClick={handleSignIn}
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              Entrar
            </button>
          </div>
        </form>
      )}

      {message && (
        <div className={`mt-4 p-2 rounded ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  )
} 