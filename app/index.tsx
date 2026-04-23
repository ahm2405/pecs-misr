import { useEffect } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { getSetting } from '../services/database';

export default function Index() {
  const db = useSQLiteContext();

  useEffect(() => {
    const check = async () => {
      const setupComplete = await getSetting(db, 'setup_complete');
      if (setupComplete === 'true') {
        router.replace('/(child)');
      } else {
        router.replace('/setup');
      }
    };
    check();
  }, []);

  return null;
}
