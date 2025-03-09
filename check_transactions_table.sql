-- Criar ou substituir a função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Verificar se a tabela "transactions" existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'transactions'
    ) THEN
        -- Criar a tabela "transactions" se não existir
        CREATE TABLE transactions (
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
        CREATE INDEX idx_transactions_user_id ON transactions(user_id);
        CREATE INDEX idx_transactions_date ON transactions(date);

        -- Habilitar RLS
        ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

        -- Criar políticas
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

        -- Criar trigger para atualizar o timestamp
        DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
        CREATE TRIGGER update_transactions_updated_at
        BEFORE UPDATE ON transactions
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();

        RAISE NOTICE 'Tabela "transactions" criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela "transactions" já existe.';
        
        -- Verificar se as colunas necessárias existem
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'transactions' 
            AND column_name = 'payment_status'
        ) THEN
            ALTER TABLE transactions ADD COLUMN payment_status TEXT CHECK (payment_status IN ('paid', 'pending'));
            RAISE NOTICE 'Coluna payment_status adicionada à tabela transactions.';
        END IF;
        
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'transactions' 
            AND column_name = 'due_date'
        ) THEN
            ALTER TABLE transactions ADD COLUMN due_date DATE;
            RAISE NOTICE 'Coluna due_date adicionada à tabela transactions.';
        END IF;
        
        -- Verificar se o trigger existe
        IF NOT EXISTS (
            SELECT FROM pg_trigger 
            WHERE tgname = 'update_transactions_updated_at'
        ) THEN
            DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
            CREATE TRIGGER update_transactions_updated_at
            BEFORE UPDATE ON transactions
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at_column();
            RAISE NOTICE 'Trigger update_transactions_updated_at criado.';
        END IF;
    END IF;
END
$$; 