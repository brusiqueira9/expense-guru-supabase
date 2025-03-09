import { supabase } from './supabase';
import { Transaction, TransactionType } from '@/types';

// Interfaces para os tipos de dados
interface Category {
  id?: string;
  user_id: string;
  name: string;
  description?: string;
  type: 'income' | 'expense';
}

// Tipos de status de pagamento válidos
type PaymentStatus = 'paid' | 'pending' | 'scheduled';

// Função para converter camelCase para snake_case
const toSnakeCase = (str: string) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Função para converter objeto de camelCase para snake_case
const objectToSnakeCase = (obj: any) => {
  const result: any = {};
  Object.keys(obj).forEach(key => {
    result[toSnakeCase(key)] = obj[key];
  });
  return result;
};

// Função para converter snake_case para camelCase
const toCamelCase = (str: string) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Função para converter objeto de snake_case para camelCase
const objectToCamelCase = (obj: any) => {
  if (!obj) return obj;
  const result: any = {};
  Object.keys(obj).forEach(key => {
    result[toCamelCase(key)] = obj[key];
  });
  return result;
};

// Função para validar e normalizar o status de pagamento
const validatePaymentStatus = (status: any, type: string): PaymentStatus | undefined => {
  // Se o tipo for 'income', o status de pagamento deve ser undefined
  if (type === 'income') {
    return undefined;
  }
  
  // Se o status for undefined ou null e o tipo for 'expense', o padrão é 'pending'
  if (status === undefined || status === null) {
    return 'pending';
  }
  
  // Verificar se o status é válido
  if (['paid', 'pending', 'scheduled'].includes(status)) {
    return status as PaymentStatus;
  }
  
  // Se o status não for válido, o padrão é 'pending'
  return 'pending';
};

// Serviço para gerenciar transações no Supabase
export const transactionService = {
  // Buscar todas as transações do usuário
  async getAll(userId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        // Erro ao buscar transações
        return [];
      }

      return data || [];
    } catch (error) {
      // Erro ao buscar transações
      return [];
    }
  },

  // Adicionar uma nova transação
  async add(transaction: Omit<Transaction, 'id'> & { user_id: string }) {
    try {
      console.log('Adicionando transação:', transaction);
      
      // Criar um novo objeto com os campos normalizados
      const validatedTransaction = {
        ...transaction,
      };
      
      // Adicionar o campo payment_status com o valor validado
      (validatedTransaction as any).payment_status = validatePaymentStatus(
        transaction.paymentStatus, 
        transaction.type
      );
      
      // Remover o campo paymentStatus original para evitar duplicação
      if ('paymentStatus' in validatedTransaction) {
        delete (validatedTransaction as any).paymentStatus;
      }
      
      // Converter o objeto de camelCase para snake_case
      const snakeCaseTransaction = objectToSnakeCase(validatedTransaction);
      
      console.log('Transação convertida para snake_case:', snakeCaseTransaction);
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([snakeCaseTransaction])
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao adicionar transação:', error);
        throw error;
      }
      
      // Converter o objeto retornado de snake_case para camelCase
      return objectToCamelCase(data);
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  },

  // Atualizar uma transação existente
  async update(id: string, transaction: Partial<Transaction>) {
    try {
      // Criar um novo objeto com os campos normalizados
      const validatedTransaction = {
        ...transaction,
      };
      
      // Se o tipo e o status de pagamento estiverem presentes, validar o status
      if ('type' in transaction && 'paymentStatus' in transaction) {
        (validatedTransaction as any).payment_status = validatePaymentStatus(
          transaction.paymentStatus, 
          transaction.type as string
        );
        
        // Remover o campo paymentStatus original para evitar duplicação
        delete (validatedTransaction as any).paymentStatus;
      }
      
      // Converter o objeto de camelCase para snake_case
      const snakeCaseTransaction = objectToSnakeCase(validatedTransaction);
      
      const { data, error } = await supabase
        .from('transactions')
        .update(snakeCaseTransaction)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao atualizar transação:', error);
        throw error;
      }
      
      // Converter o objeto retornado de snake_case para camelCase
      return objectToCamelCase(data);
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }
  },

  // Excluir uma transação
  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro detalhado ao excluir transação:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      throw error;
    }
  },

  // Migrar transações do localStorage para o Supabase
  async migrateFromLocalStorage(userId: string, transactions: Transaction[]) {
    try {
      // Validar e normalizar o status de pagamento para cada transação
      const validatedTransactions = transactions.map(transaction => {
        const validatedTransaction = {
          ...transaction,
          user_id: userId,
        };
        
        // Adicionar o campo payment_status com o valor validado
        (validatedTransaction as any).payment_status = validatePaymentStatus(
          transaction.paymentStatus, 
          transaction.type
        );
        
        // Remover o campo paymentStatus original para evitar duplicação
        if ('paymentStatus' in validatedTransaction) {
          delete (validatedTransaction as any).paymentStatus;
        }
        
        return validatedTransaction;
      });
      
      // Converter para snake_case
      const snakeCaseTransactions = validatedTransactions.map(objectToSnakeCase);

      console.log('Migrando transações:', snakeCaseTransactions);
      
      // Insere todas as transações de uma vez
      const { data, error } = await supabase
        .from('transactions')
        .insert(snakeCaseTransactions);

      if (error) {
        console.error('Erro detalhado ao migrar transações:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao migrar transações:', error);
      throw error;
    }
  }
};

// Serviço para gerenciar contas no Supabase
export const accountService = {
  // Buscar todas as contas do usuário
  async getAll(userId: string) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      
      // Converter os objetos de snake_case para camelCase
      return (data || []).map(objectToCamelCase);
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      throw error;
    }
  }
};

// Serviço para gerenciar metas no Supabase
export const goalService = {
  // Buscar todas as metas do usuário
  async getAll(userId: string) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Converter os objetos de snake_case para camelCase
      return (data || []).map(objectToCamelCase);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      throw error;
    }
  }
};

// Serviço para gerenciar categorias no Supabase
export const categoryService = {
  // Buscar todas as categorias do usuário
  async getAll(userId: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      
      // Converter os objetos de snake_case para camelCase
      return (data || []).map(objectToCamelCase);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  },
  
  // Adicionar uma nova categoria
  async add(category: Category) {
    try {
      // Converter o objeto de camelCase para snake_case
      const snakeCaseCategory = objectToSnakeCase(category);
      
      const { data, error } = await supabase
        .from('categories')
        .insert([snakeCaseCategory])
        .select()
        .single();

      if (error) throw error;
      
      // Converter o objeto retornado de snake_case para camelCase
      return objectToCamelCase(data);
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      throw error;
    }
  },
  
  // Atualizar uma categoria existente
  async update(id: string, category: Partial<Category>) {
    try {
      // Converter o objeto de camelCase para snake_case
      const snakeCaseCategory = objectToSnakeCase(category);
      
      const { data, error } = await supabase
        .from('categories')
        .update(snakeCaseCategory)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Converter o objeto retornado de snake_case para camelCase
      return objectToCamelCase(data);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  },
  
  // Excluir uma categoria
  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      throw error;
    }
  }
};

// Serviço para gerenciar preferências do usuário no Supabase
export const userPreferencesService = {
  // Buscar preferências do usuário
  async get(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Converter o objeto de snake_case para camelCase
      return objectToCamelCase(data);
    } catch (error) {
      console.error('Erro ao buscar preferências do usuário:', error);
      throw error;
    }
  }
};

// Serviço para gerenciar carteiras no Supabase
export const walletService = {
  // Buscar todas as carteiras do usuário
  async getAll(userId: string) {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) {
        // Erro ao buscar carteiras
        return [];
      }

      return data || [];
    } catch (error) {
      // Erro ao buscar carteiras
      return [];
    }
  }
};

// Funções auxiliares para carteiras
export async function createWallet(wallet: { name: string; description: string; balance: number; user_id: string }) {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .insert([wallet])
      .select()
      .single();

    if (error) {
      // Erro ao criar carteira
      return null;
    }

    return data;
  } catch (error) {
    // Erro ao criar carteira
    return null;
  }
}

export async function updateWallet(wallet: { id: number; name: string; description: string; balance: number }) {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .update(wallet)
      .eq('id', wallet.id)
      .select()
      .single();

    if (error) {
      // Erro ao atualizar carteira
      return null;
    }

    return data;
  } catch (error) {
    // Erro ao atualizar carteira
    return null;
  }
}

export async function deleteWallet(walletId: string) {
  try {
    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', walletId);

    if (error) {
      // Erro ao excluir carteira
      return false;
    }

    return true;
  } catch (error) {
    // Erro ao excluir carteira
    return false;
  }
} 