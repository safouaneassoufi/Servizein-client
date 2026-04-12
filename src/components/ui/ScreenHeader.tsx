import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, showBack = true, right }: Props) {
  const router = useRouter();
  return (
    <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100 gap-3">
      {showBack && (
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-9 w-9 rounded-xl bg-gray-100 items-center justify-center"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={18} color="#374151" />
        </TouchableOpacity>
      )}
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{title}</Text>
        {subtitle && <Text className="text-xs text-gray-500 mt-0.5">{subtitle}</Text>}
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}
