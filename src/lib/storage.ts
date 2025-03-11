import { Transaction } from "@/types";

const STORAGE_KEY_PREFIX = 'expense-guru:transactions';
const OLD_STORAGE_KEY = 'expense-tracker-transactions';
const ORIGINAL_USER_EMAIL = 'contato@brunosiqueira.tec.br';

// Função para encontrar e restaurar dados
export const findAndRestoreData = (userId: string, userEmail: string): boolean => {
  try {
    // Se não for o usuário original, não faz nada
    if (userEmail !== ORIGINAL_USER_EMAIL) {
      return false;
    }

    // Primeiro, procura por dados no formato antigo
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    
    // Procura por dados em todas as chaves do localStorage
    let foundData = oldData;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          foundData = data;
          localStorage.removeItem(key); // Remove os dados da chave incorreta
        }
      }
    }

    if (!foundData) {
      return false;
    }

    // Salva os dados encontrados na chave correta
    const storageKey = `${STORAGE_KEY_PREFIX}:${userId}`;
    localStorage.setItem(storageKey, foundData);
    
    // Remove os dados antigos se existirem
    localStorage.removeItem(OLD_STORAGE_KEY);
    
    return true;
  } catch (error) {
    console.error("Erro ao restaurar dados:", error);
    return false;
  }
};

export const migrateOldData = (userId: string, userEmail: string): boolean => {
  try {
    // Só migra os dados se for o usuário original
    if (userEmail !== ORIGINAL_USER_EMAIL) {
      return false;
    }

    // Tenta carregar dados do formato antigo
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    if (!oldData) return false;

    // Se encontrou dados antigos, salva no novo formato
    const transactions = JSON.parse(oldData);
    const storageKey = `${STORAGE_KEY_PREFIX}:${userId}`;
    localStorage.setItem(storageKey, oldData);
    
    // Limpa os dados antigos
    localStorage.removeItem(OLD_STORAGE_KEY);
    
    return true;
  } catch (error) {
    console.error("Erro ao migrar dados antigos:", error);
    return false;
  }
};

export const saveTransactions = (userId: string, transactions: Transaction[]): void => {
  const storageKey = `${STORAGE_KEY_PREFIX}:${userId}`;
  localStorage.setItem(storageKey, JSON.stringify(transactions));
};

export const loadTransactions = (userId: string, userEmail: string): Transaction[] => {
  // Primeiro tenta restaurar dados perdidos
  const wasRestored = findAndRestoreData(userId, userEmail);
  if (wasRestored) {
    console.log("Dados restaurados com sucesso!");
  }

  // Tenta carregar no novo formato
  const storageKey = `${STORAGE_KEY_PREFIX}:${userId}`;
  const data = localStorage.getItem(storageKey);
  
  // Se não encontrou dados no novo formato, tenta migrar dados antigos
  if (!data) {
    const wasMigrated = migrateOldData(userId, userEmail);
    if (wasMigrated) {
      // Se migrou com sucesso, tenta carregar novamente
      const migratedData = localStorage.getItem(storageKey);
      if (migratedData) {
        try {
          return JSON.parse(migratedData);
        } catch (error) {
          console.error("Erro ao carregar dados migrados:", error);
          return [];
        }
      }
    }
    return [];
  }
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao carregar transações:", error);
    return [];
  }
};

export const clearTransactions = (userId: string) => {
  const storageKey = `${STORAGE_KEY_PREFIX}:${userId}`;
  localStorage.removeItem(storageKey);
};
