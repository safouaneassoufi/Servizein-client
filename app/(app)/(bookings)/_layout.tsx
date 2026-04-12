import { Stack } from 'expo-router';

export default function BookingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="new/date" />
      <Stack.Screen name="new/address" />
      <Stack.Screen name="new/summary" />
      <Stack.Screen name="new/success" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
