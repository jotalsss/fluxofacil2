
import type { Category } from './types';
import { 
  ShoppingCart, 
  Utensils, 
  Home, 
  Car, 
  Shirt, 
  Film, 
  HeartPulse, 
  BookOpen, 
  Briefcase, 
  Landmark, 
  Gift, 
  HelpingHand,
  CircleDollarSign,
  Repeat, // Ícone para Assinaturas
  Tag
} from 'lucide-react';

export const APP_NAME = "FluxoFacil";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salário', icon: Briefcase },
  { id: 'groceries', name: 'Supermercado', icon: ShoppingCart },
  { id: 'food_dining', name: 'Alimentação e Refeições', icon: Utensils },
  { id: 'housing', name: 'Moradia', icon: Home },
  { id: 'transportation', name: 'Transporte', icon: Car },
  { id: 'utilities', name: 'Contas Fixas', icon: CircleDollarSign }, // Example: Water, Electricity, Internet
  { id: 'subscriptions', name: 'Assinaturas', icon: Repeat }, // Nova categoria
  { id: 'clothing', name: 'Vestuário', icon: Shirt },
  { id: 'entertainment', name: 'Entretenimento', icon: Film },
  { id: 'health_wellness', name: 'Saúde e Bem-estar', icon: HeartPulse },
  { id: 'education', name: 'Educação', icon: BookOpen },
  { id: 'investments', name: 'Investimentos', icon: Landmark },
  { id: 'gifts', name: 'Presentes', icon: Gift },
  { id: 'donations', name: 'Doações', icon: HelpingHand },
  { id: 'other', name: 'Outros', icon: Tag },
];

export const CATEGORIES_MAP: Map<string, Category> = new Map(
  DEFAULT_CATEGORIES.map(category => [category.id, category])
);
