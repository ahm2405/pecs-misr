import { Category } from '../types';

interface DefaultCard {
  id: string;
  word_arabic: string;
  category: Category;
  position: number;
  image_path: null;
  audio_path: null;
}

export const DEFAULT_CARDS: DefaultCard[] = [
  { id: 'seed-01', word_arabic: 'ماما', category: 'people', position: 1, image_path: null, audio_path: null },
  { id: 'seed-02', word_arabic: 'بابا', category: 'people', position: 2, image_path: null, audio_path: null },
  { id: 'seed-03', word_arabic: 'عايز', category: 'actions', position: 3, image_path: null, audio_path: null },
  { id: 'seed-04', word_arabic: 'مش عايز', category: 'actions', position: 4, image_path: null, audio_path: null },
  { id: 'seed-05', word_arabic: 'أكل', category: 'food', position: 5, image_path: null, audio_path: null },
  { id: 'seed-06', word_arabic: 'عصير', category: 'food', position: 6, image_path: null, audio_path: null },
  { id: 'seed-07', word_arabic: 'مية', category: 'food', position: 7, image_path: null, audio_path: null },
  { id: 'seed-08', word_arabic: 'حمام', category: 'places', position: 8, image_path: null, audio_path: null },
  { id: 'seed-09', word_arabic: 'بيت', category: 'places', position: 9, image_path: null, audio_path: null },
  { id: 'seed-10', word_arabic: 'مدرسة', category: 'places', position: 10, image_path: null, audio_path: null },
  { id: 'seed-11', word_arabic: 'كويس', category: 'feelings', position: 11, image_path: null, audio_path: null },
  { id: 'seed-12', word_arabic: 'مش كويس', category: 'feelings', position: 12, image_path: null, audio_path: null },
  { id: 'seed-13', word_arabic: 'زعلان', category: 'feelings', position: 13, image_path: null, audio_path: null },
  { id: 'seed-14', word_arabic: 'العب', category: 'actions', position: 14, image_path: null, audio_path: null },
  { id: 'seed-15', word_arabic: 'نام', category: 'actions', position: 15, image_path: null, audio_path: null },
  { id: 'seed-16', word_arabic: 'وجعني', category: 'feelings', position: 16, image_path: null, audio_path: null },
  { id: 'seed-17', word_arabic: 'تعبان', category: 'feelings', position: 17, image_path: null, audio_path: null },
  { id: 'seed-18', word_arabic: 'برة', category: 'places', position: 18, image_path: null, audio_path: null },
  { id: 'seed-19', word_arabic: 'مساعدة', category: 'actions', position: 19, image_path: null, audio_path: null },
  { id: 'seed-20', word_arabic: 'شكراً', category: 'actions', position: 20, image_path: null, audio_path: null },
];
