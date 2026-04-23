import * as Crypto from 'expo-crypto';
import { useSQLiteContext } from 'expo-sqlite';
import { getParent, setParentPin, getSetting, setSetting } from '../services/database';

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export function useParentAuth() {
  const db = useSQLiteContext();

  async function verifyPin(parentId: 1 | 2, enteredPin: string): Promise<boolean> {
    const parent = await getParent(db, parentId);
    if (!parent?.pin_hash) return false;
    const hash = await hashPin(enteredPin);
    return hash === parent.pin_hash;
  }

  async function setupPin(parentId: 1 | 2, pin: string): Promise<void> {
    const hash = await hashPin(pin);
    await setParentPin(db, parentId, hash);
  }

  async function isPinSet(parentId: 1 | 2): Promise<boolean> {
    const parent = await getParent(db, parentId);
    return !!parent?.pin_hash;
  }

  async function isSetupComplete(): Promise<boolean> {
    const val = await getSetting(db, 'setup_complete');
    return val === 'true';
  }

  async function markSetupComplete(): Promise<void> {
    await setSetting(db, 'setup_complete', 'true');
  }

  return { verifyPin, setupPin, isPinSet, isSetupComplete, markSetupComplete };
}
