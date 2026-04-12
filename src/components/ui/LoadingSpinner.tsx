import { View, ActivityIndicator } from 'react-native';

export function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }
  return (
    <View className="py-12 items-center justify-center">
      <ActivityIndicator size="large" color="#1a56db" />
    </View>
  );
}
