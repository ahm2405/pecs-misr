export type Category = 'people' | 'actions' | 'food' | 'places' | 'feelings' | 'other';

export interface Card {
  id: string;
  word_arabic: string;
  image_path: string | null;
  audio_path: string | null;
  position: number;
  category: Category;
  created_at: string;
}

export interface Parent {
  id: 1 | 2;
  name: string;
  pin_hash: string | null;
}

export type AudioStatus = 'none' | 'generating' | 'ready';

export interface SentenceCard {
  card: Card;
  key: string;
}
