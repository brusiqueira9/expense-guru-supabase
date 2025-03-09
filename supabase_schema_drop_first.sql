-- Esquema para o banco de dados Supabase do Expense Guru (versão com exclusão de políticas)

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  payment_status TEXT CHECK (payment_status IN ('paid', 'pending')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para melhorar a performance das consultas por usuário
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- Tabela de contas
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para melhorar a performance das consultas por usuário
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- Tabela de metas financeiras
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  deadline DATE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para melhorar a performance das consultas por usuário
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

-- Índice para melhorar a performance das consultas por usuário
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  notifications BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT false,
  currency TEXT DEFAULT 'BRL',
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Políticas de segurança RLS (Row Level Security)

-- Habilitar RLS em todas as tabelas
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias transações" ON transactions;
DROP POLICY IF EXISTS "Usuários podem inserir apenas suas próprias transações" ON transactions;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas próprias transações" ON transactions;
DROP POLICY IF EXISTS "Usuários podem excluir apenas suas próprias transações" ON transactions;

DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias contas" ON accounts;
DROP POLICY IF EXISTS "Usuários podem inserir apenas suas próprias contas" ON accounts;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas próprias contas" ON accounts;
DROP POLICY IF EXISTS "Usuários podem excluir apenas suas próprias contas" ON accounts;

DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias metas" ON goals;
DROP POLICY IF EXISTS "Usuários podem inserir apenas suas próprias metas" ON goals;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas próprias metas" ON goals;
DROP POLICY IF EXISTS "Usuários podem excluir apenas suas próprias metas" ON goals;

DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias categorias" ON categories;
DROP POLICY IF EXISTS "Usuários podem inserir apenas suas próprias categorias" ON categories;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas próprias categorias" ON categories;
DROP POLICY IF EXISTS "Usuários podem excluir apenas suas próprias categorias" ON categories;

DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias preferências" ON user_preferences;
DROP POLICY IF EXISTS "Usuários podem inserir apenas suas próprias preferências" ON user_preferences;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas próprias preferências" ON user_preferences;
DROP POLICY IF EXISTS "Usuários podem excluir apenas suas próprias preferências" ON user_preferences;

-- Políticas para transações
CREATE POLICY "Usuários podem ver apenas suas próprias transações" 
  ON transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias transações" 
  ON transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias transações" 
  ON transactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias transações" 
  ON transactions FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para contas
CREATE POLICY "Usuários podem ver apenas suas próprias contas" 
  ON accounts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias contas" 
  ON accounts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias contas" 
  ON accounts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias contas" 
  ON accounts FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para metas
CREATE POLICY "Usuários podem ver apenas suas próprias metas" 
  ON goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias metas" 
  ON goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias metas" 
  ON goals FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias metas" 
  ON goals FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para categorias
CREATE POLICY "Usuários podem ver apenas suas próprias categorias" 
  ON categories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias categorias" 
  ON categories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias categorias" 
  ON categories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias categorias" 
  ON categories FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para preferências do usuário
CREATE POLICY "Usuários podem ver apenas suas próprias preferências" 
  ON user_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias preferências" 
  ON user_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias preferências" 
  ON user_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias preferências" 
  ON user_preferences FOR DELETE 
  USING (auth.uid() = user_id);

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar o timestamp de atualização
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON accounts
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON goals
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 