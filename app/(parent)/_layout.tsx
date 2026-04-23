import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#FAFAFA' },
        headerTintColor: '#1976D2',
        headerTitleStyle: { fontFamily: 'Cairo_700Bold', fontSize: 18 },
        headerBackTitle: 'رجوع',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'إدارة البطاقات' }} />
      <Stack.Screen name="add-card" options={{ title: 'إضافة بطاقة' }} />
      <Stack.Screen name="edit-card" options={{ title: 'تعديل بطاقة' }} />
      <Stack.Screen name="settings" options={{ title: 'الإعدادات' }} />
    </Stack>
  );
}
