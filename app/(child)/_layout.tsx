import { Stack } from 'expo-router';

export default function ChildLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, statusBarHidden: true }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
