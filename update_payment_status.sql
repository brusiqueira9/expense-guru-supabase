-- Script para atualizar a restrição de verificação da coluna payment_status

-- 1. Remover a restrição existente
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_payment_status_check;

-- 2. Adicionar a nova restrição com o valor 'scheduled'
ALTER TABLE transactions ADD CONSTRAINT transactions_payment_status_check 
CHECK (payment_status IN ('paid', 'pending', 'scheduled'));

-- 3. Verificar a nova restrição
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'transactions_payment_status_check'; 