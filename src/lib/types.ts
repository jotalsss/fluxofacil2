import type { LucideIcon } from 'lucide-react';

export interface Transaction {
  id: string;
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
