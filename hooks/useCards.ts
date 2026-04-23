import { useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Card } from '../types';
import { getAllCards, addCard, updateCard, deleteCard } from '../services/database';
import { deleteAudioFile, deleteImageFile } from '../services/fileStorage';

export function useCards() {
  const db = useSQLiteContext();
  const [cards, setCards] = useState<Card[]>([]);

  const loadCards = useCallback(async () => {
    const all = await getAllCards(db);
    setCards(all);
  }, [db]);

  const createCard = useCallback(async (card: Omit<Card, 'created_at'>) => {
    await addCard(db, card);
    await loadCards();
  }, [db, loadCards]);

  const editCard = useCallback(async (id: string, updates: Partial<Omit<Card, 'id' | 'created_at'>>) => {
    await updateCard(db, id, updates);
    await loadCards();
  }, [db, loadCards]);

  const removeCard = useCallback(async (id: string) => {
    await deleteCard(db, id);
    await deleteAudioFile(id);
    await deleteImageFile(id);
    await loadCards();
  }, [db, loadCards]);

  return { cards, loadCards, createCard, editCard, removeCard };
}
