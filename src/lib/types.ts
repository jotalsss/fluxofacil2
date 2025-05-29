
import type { LucideIcon } from 'lucide-react';

export interface Transaction {
  id: string;
  userId: string; 
  date: Date; // Data da parcela específica ou da transação única
  description: string;
  amount: number; // Para parcelas, este será o valor da parcela.
  type: 'income' | 'expense';
  category: string; 
  tags: string[];
  isInstallment?: boolean; // É uma parcela?
  installmentNumber?: number; // Número da parcela atual (ex: 1, 2, 3)
  totalInstallments?: number; // Número total de parcelas
  originalPurchaseId?: string; // ID para agrupar todas as parcelas de uma compra
  totalPurchaseAmount?: number; // Valor total da compra original parcelada
}

export interface Category {
  id: string;
  name: string;
  icon?: LucideIcon;
}
