import * as FileSystem from 'expo-file-system';

export async function ensureAudioDirectory(): Promise<void> {
  const dir = `${FileSystem.documentDirectory}audio/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

export async function ensureImagesDirectory(): Promise<void> {
  const dir = `${FileSystem.documentDirectory}images/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

export function getAudioPath(cardId: string): string {
  return `${FileSystem.documentDirectory}audio/${cardId}.mp3`;
}

export function getImagePath(cardId: string): string {
  return `${FileSystem.documentDirectory}images/${cardId}.jpg`;
}

export async function saveImageFromUri(uri: string, cardId: string): Promise<string> {
  await ensureImagesDirectory();
  const dest = getImagePath(cardId);
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export async function deleteAudioFile(cardId: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(getAudioPath(cardId), { idempotent: true });
  } catch {
    // ignore
  }
}

export async function deleteImageFile(cardId: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(getImagePath(cardId), { idempotent: true });
  } catch {
    // ignore
  }
}
