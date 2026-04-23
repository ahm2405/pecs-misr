import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { ensureAudioDirectory, getAudioPath } from './fileStorage';
import { Card } from '../types';

export async function generateAudio(
  wordArabic: string,
  cardId: string,
  apiKey: string,
  voiceId: string
): Promise<string | null> {
  try {
    await ensureAudioDirectory();
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: wordArabic,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);

    const audioBlob = await response.blob();
    const audioPath = getAudioPath(cardId);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          await FileSystem.writeAsStringAsync(audioPath, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          resolve(audioPath);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(audioBlob);
    });
  } catch {
    return null;
  }
}

export async function playAudio(audioPath: string): Promise<void> {
  const { sound } = await Audio.Sound.createAsync(
    { uri: audioPath },
    { shouldPlay: true }
  );
  return new Promise((resolve) => {
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        resolve();
      }
    });
  });
}

export function speakFallback(wordArabic: string): void {
  Speech.speak(wordArabic, { language: 'ar-EG', rate: 0.8, pitch: 1.0 });
}

export async function playCardAudio(card: Card): Promise<void> {
  if (card.audio_path) {
    const info = await FileSystem.getInfoAsync(card.audio_path);
    if (info.exists) {
      await playAudio(card.audio_path);
      return;
    }
  }
  speakFallback(card.word_arabic);
}

export async function playSequence(cards: Card[]): Promise<void> {
  for (let i = 0; i < cards.length; i++) {
    await playCardAudio(cards[i]);
    if (i < cards.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
}

export async function preGenerateDefaultAudio(
  apiKey: string,
  voiceId: string,
  cards: Card[],
  onProgress: (done: number, total: number) => void,
  onCardDone?: (cardId: string, audioPath: string) => Promise<void>
): Promise<void> {
  let done = 0;
  for (const card of cards) {
    if (!card.audio_path) {
      const path = await generateAudio(card.word_arabic, card.id, apiKey, voiceId);
      if (path && onCardDone) {
        await onCardDone(card.id, path);
      }
    }
    done++;
    onProgress(done, cards.length);
  }
}
