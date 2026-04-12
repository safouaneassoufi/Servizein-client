import { View, Text } from 'react-native';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'muted';

const styles: Record<Variant, { bg: string; text: string }> = {
  success: { bg: 'bg-green-100', text: 'text-green-700' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700' },
  danger: { bg: 'bg-red-100', text: 'text-red-700' },
  info: { bg: 'bg-blue-100', text: 'text-blue-700' },
  muted: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export function Badge({ label, variant = 'muted' }: { label: string; variant?: Variant }) {
  const s = styles[variant];
  return (
    <View className={`rounded-full px-2.5 py-0.5 self-start ${s.bg}`}>
      <Text className={`text-xs font-semibold ${s.text}`}>{label}</Text>
    </View>
  );
}
