import { useState, useRef, useCallback } from 'react';
import { Card } from '../types';
import { playSequence, playCardAudio } from '../services/audio';

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const cancelRef = useRef(false);

  const playSingle = useCallback(async (card: Card) => {
    await playCardAudio(card);
  }, []);

  const playAll = useCallback(async (cards: Card[]) => {
    if (isPlaying || cards.length === 0) return;
    cancelRef.current = false;
    setIsPlaying(true);
    try {
      await playSequence(cards);
    } finally {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const stop = useCallback(() => {
    cancelRef.current = true;
    setIsPlaying(false);
  }, []);

  return { isPlaying, playSingle, playAll, stop };
}
