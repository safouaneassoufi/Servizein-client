import { Stack } from 'expo-router';

export default function RequestsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new/description" />
      <Stack.Screen name="new/photos" />
      <Stack.Screen name="new/confirm" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
