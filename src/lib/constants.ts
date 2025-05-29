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
  Tag
} from 'lucide-react';

export const APP_NAME = "FluxoFacil";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', icon: Briefcase },
  { id: 'groceries', name: 'Groceries', icon: ShoppingCart },
  { id: 'food_dining', name: 'Food & Dining', icon: Utensils },
  { id: 'housing', name: 'Housing', icon: Home },
  { id: 'transportation', name: 'Transportation', icon: Car },
  { id: 'utilities', name: 'Utilities', icon: CircleDollarSign },
  { id: 'clothing', name: 'Clothing', icon: Shirt },
  { id: 'entertainment', name: 'Entertainment', icon: Film },
  { id: 'health_wellness', name: 'Health & Wellness', icon: HeartPulse },
  { id: 'education', name: 'Education', icon: BookOpen },
  { id: 'investments', name: 'Investments', icon: Landmark },
  { id: 'gifts', name: 'Gifts', icon: Gift },
  { id: 'donations', name: 'Donations', icon: HelpingHand },
  { id: 'other', name: 'Other', icon: Tag },
];

export const CATEGORIES_MAP: Map<string, Category> = new Map(
  DEFAULT_CATEGORIES.map(category => [category.id, category])
);
