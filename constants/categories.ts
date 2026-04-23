import { Category } from '../types';

export const CATEGORY_COLORS: Record<Category, string> = {
  people: '#FFD700',
  actions: '#4CAF50',
  food: '#FF9800',
  places: '#2196F3',
  feelings: '#F44336',
  other: '#9C27B0',
};

export const CATEGORY_LABELS_ARABIC: Record<Category, string> = {
  people: 'ناس',
  actions: 'أفعال',
  food: 'أكل',
  places: 'أماكن',
  feelings: 'مشاعر',
  other: 'أخرى',
};

export const CATEGORIES: Category[] = ['people', 'actions', 'food', 'places', 'feelings', 'other'];
