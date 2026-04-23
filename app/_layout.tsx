import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import {
  useFonts,
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from '@expo-google-fonts/cairo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDatabase } from '../services/database';

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F4F8' }}>
      <ActivityIndicator size="large" color="#1976D2" />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  if (!fontsLoaded) return <Loading />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider
        databaseName="pecs_misr.db"
        onInit={initDatabase}
        useSuspense={false}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="setup" />
          <Stack.Screen name="(child)" />
          <Stack.Screen name="(parent)" />
        </Stack>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
