
import { Transaction } from "@/types";

const STORAGE_KEY = "expense-tracker-transactions";

export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const loadTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse transactions from localStorage:", error);
    return [];
  }
};
