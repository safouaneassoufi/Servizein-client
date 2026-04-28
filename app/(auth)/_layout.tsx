import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="change-password" />
      {/* Email auth */}
      <Stack.Screen name="login-email" />
      <Stack.Screen name="register-email" />
      <Stack.Screen name="verify-email" />
      {/* Firebase Phone auth */}
      <Stack.Screen name="phone-login" />
      <Stack.Screen name="phone-otp" />
    </Stack>
  );
}
