-- Script para verificar e corrigir a tabela de transações

-- 1. Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'transactions'
);

-- 2. Listar as colunas da tabela (se existir)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- 3. Listar as políticas RLS da tabela
SELECT * FROM pg_policies WHERE tablename = 'transactions';

-- 4. Verificar se o RLS está habilitado
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'transactions';

-- 5. Verificar os triggers da tabela
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'transactions';

-- 6. Verificar os índices da tabela
SELECT
    i.relname AS index_name,
    a.attname AS column_name
FROM
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
WHERE
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND a.attnum = ANY(ix.indkey)
    AND t.relkind = 'r'
    AND t.relname = 'transactions'
ORDER BY
    i.relname; 