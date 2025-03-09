-- Script para criar a tabela de transações

-- Criar a tabela se não existir
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

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- Habilitar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Criar função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar o timestamp
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Criar políticas RLS
DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias transações" ON transactions;
CREATE POLICY "Usuários podem ver apenas suas próprias transações" 
    ON transactions FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir apenas suas próprias transações" ON transactions;
CREATE POLICY "Usuários podem inserir apenas suas próprias transações" 
    ON transactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas próprias transações" ON transactions;
CREATE POLICY "Usuários podem atualizar apenas suas próprias transações" 
    ON transactions FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir apenas suas próprias transações" ON transactions;
CREATE POLICY "Usuários podem excluir apenas suas próprias transações" 
    ON transactions FOR DELETE 
    USING (auth.uid() = user_id); 