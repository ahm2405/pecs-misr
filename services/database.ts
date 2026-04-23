import * as SQLite from 'expo-sqlite';
import { Card, Parent } from '../types';
import { DEFAULT_CARDS } from '../constants/defaultCards';

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      word_arabic TEXT NOT NULL,
      image_path TEXT,
      audio_path TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL DEFAULT 'other',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS parents (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      pin_hash TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Seed parents (idempotent)
  await db.execAsync(`
    INSERT OR IGNORE INTO parents (id, name, pin_hash) VALUES (1, 'الوالد أ', null);
    INSERT OR IGNORE INTO parents (id, name, pin_hash) VALUES (2, 'الوالد ب', null);
  `);

  // Seed cards only if table is empty
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM cards');
  if (result && result.count === 0) {
    const now = new Date().toISOString();
    for (const card of DEFAULT_CARDS) {
      await db.runAsync(
        'INSERT INTO cards (id, word_arabic, image_path, audio_path, position, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [card.id, card.word_arabic, null, null, card.position, card.category, now]
      );
    }
  }
}

export async function getAllCards(db: SQLite.SQLiteDatabase): Promise<Card[]> {
  return db.getAllAsync<Card>('SELECT * FROM cards ORDER BY position ASC');
}

export async function addCard(
  db: SQLite.SQLiteDatabase,
  card: Omit<Card, 'created_at'>
): Promise<void> {
  await db.runAsync(
    'INSERT INTO cards (id, word_arabic, image_path, audio_path, position, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [card.id, card.word_arabic, card.image_path, card.audio_path, card.position, card.category, new Date().toISOString()]
  );
}

export async function updateCard(
  db: SQLite.SQLiteDatabase,
  id: string,
  updates: Partial<Omit<Card, 'id' | 'created_at'>>
): Promise<void> {
  const fields = Object.keys(updates) as (keyof typeof updates)[];
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => updates[f] ?? null);
  await db.runAsync(`UPDATE cards SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteCard(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM cards WHERE id = ?', [id]);
}

export async function getSetting(
  db: SQLite.SQLiteDatabase,
  key: string
): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return row?.value ?? null;
}

export async function setSetting(
  db: SQLite.SQLiteDatabase,
  key: string,
  value: string
): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
}

export async function getParent(
  db: SQLite.SQLiteDatabase,
  id: 1 | 2
): Promise<Parent | null> {
  return db.getFirstAsync<Parent>('SELECT * FROM parents WHERE id = ?', [id]);
}

export async function setParentPin(
  db: SQLite.SQLiteDatabase,
  id: 1 | 2,
  pinHash: string
): Promise<void> {
  await db.runAsync('UPDATE parents SET pin_hash = ? WHERE id = ?', [pinHash, id]);
}
