import type { LucideIcon } from 'lucide-react';

export interface Transaction {
  id: string;
  userId: string; // Adicionado para associar a transação ao usuário
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string; // Category name
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  icon?: LucideIcon;
}
