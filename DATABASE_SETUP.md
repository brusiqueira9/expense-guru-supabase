# Configuração do Banco de Dados Supabase

Este documento contém instruções para configurar o banco de dados Supabase para o Expense Guru.

## Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase

## Configuração do Banco de Dados

### 1. Criar as tabelas

Execute o script SQL fornecido no arquivo `supabase_schema.sql` no Editor SQL do Supabase.

1. Acesse o painel do Supabase
2. Selecione seu projeto
3. Vá para a seção "SQL Editor"
4. Crie uma nova consulta
5. Cole o conteúdo do arquivo `supabase_schema.sql`
6. Execute a consulta

### 2. Configurar as variáveis de ambiente

Certifique-se de que as seguintes variáveis de ambiente estejam configuradas no arquivo `.env`:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

Você pode encontrar essas informações no painel do Supabase, na seção "Settings" > "API".

### 3. Habilitar autenticação

1. No painel do Supabase, vá para "Authentication" > "Providers"
2. Habilite o provedor "Email"
3. Configure as opções de acordo com suas necessidades (confirmação de email, etc.)

## Migração de Dados

O aplicativo inclui uma funcionalidade para migrar automaticamente os dados do localStorage para o Supabase. Quando um usuário faz login, o sistema verifica se existem dados no localStorage e, se existirem, migra esses dados para o Supabase.

## Estrutura do Banco de Dados

### Tabelas

1. **transactions** - Armazena todas as transações financeiras
2. **accounts** - Armazena as contas bancárias
3. **goals** - Armazena as metas financeiras
4. **categories** - Armazena as categorias de transações
5. **user_preferences** - Armazena as preferências do usuário

### Segurança

O banco de dados utiliza Row Level Security (RLS) para garantir que cada usuário tenha acesso apenas aos seus próprios dados. As políticas de segurança estão configuradas para todas as tabelas.

## Solução de Problemas

### Erro ao migrar dados

Se ocorrer um erro durante a migração de dados do localStorage para o Supabase, verifique:

1. Se as tabelas foram criadas corretamente
2. Se o usuário está autenticado
3. Se as políticas de segurança estão configuradas corretamente

### Erro ao salvar transações

Se ocorrer um erro ao salvar transações no Supabase, verifique:

1. Se o usuário está autenticado
2. Se a estrutura da transação está correta (todos os campos obrigatórios estão presentes)
3. Se as políticas de segurança permitem a inserção de dados

## Testes

Para testar a conexão com o banco de dados, você pode usar o componente `TestConnection` incluído no projeto. Este componente permite testar a autenticação e a inserção de dados no banco de dados. 