// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

console.log("Delete Account function initialized")

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Usar as variáveis de ambiente do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRole) {
      console.error('Variáveis de ambiente não configuradas:', { 
        supabaseUrl: !!supabaseUrl, 
        supabaseServiceRole: !!supabaseServiceRole 
      })
      throw new Error('Configuração do servidor incompleta')
    }

    // Criar cliente Supabase com a chave de serviço
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Pegar o token JWT do cabeçalho da requisição
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Não autorizado: Token não fornecido')
    }

    // Verificar o usuário atual
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError) {
      console.error('Erro ao verificar usuário:', userError)
      throw new Error('Não autorizado: Erro ao verificar usuário')
    }

    if (!user) {
      throw new Error('Não autorizado: Usuário não encontrado')
    }

    console.log(`Iniciando processo de deleção para o usuário: ${user.id}`)

    // 1. Deletar dados do usuário
    try {
      // Deletar preferências do usuário
      const { error: preferencesError } = await supabaseAdmin
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id)
      
      if (preferencesError) {
        console.error('Erro ao deletar preferências:', preferencesError)
      }

      // Deletar despesas
      const { error: expensesError } = await supabaseAdmin
        .from('expenses')
        .delete()
        .eq('user_id', user.id)
      
      if (expensesError) {
        console.error('Erro ao deletar despesas:', expensesError)
      }

      // Deletar categorias
      const { error: categoriesError } = await supabaseAdmin
        .from('categories')
        .delete()
        .eq('user_id', user.id)
      
      if (categoriesError) {
        console.error('Erro ao deletar categorias:', categoriesError)
      }

      // Deletar notificações
      const { error: notificationsError } = await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
      
      if (notificationsError) {
        console.error('Erro ao deletar notificações:', notificationsError)
      }

      console.log('Dados do usuário deletados com sucesso')
    } catch (error) {
      console.error('Erro ao deletar dados do usuário:', error)
      throw new Error('Erro ao deletar dados do usuário: ' + (error instanceof Error ? error.message : String(error)))
    }

    // 2. Deletar o usuário
    try {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

      if (deleteError) {
        console.error('Erro ao deletar usuário:', deleteError)
        throw new Error('Erro ao deletar usuário: ' + deleteError.message)
      }

      console.log('Usuário deletado com sucesso')

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Conta excluída com sucesso',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      throw new Error('Erro ao deletar usuário: ' + (error instanceof Error ? error.message : String(error)))
    }
  } catch (error) {
    console.error('Erro na função delete-account:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao deletar conta',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 