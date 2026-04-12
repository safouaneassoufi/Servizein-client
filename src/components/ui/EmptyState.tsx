import { View, Text } from 'react-native';
import { Button } from './Button';

interface Props {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = '📭', title, description, actionLabel, onAction }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16 gap-3">
      <Text className="text-5xl">{icon}</Text>
      <Text className="text-base font-bold text-gray-800 text-center">{title}</Text>
      {description && <Text className="text-sm text-gray-500 text-center">{description}</Text>}
      {actionLabel && onAction && (
        <View className="mt-2 w-48">
          <Button label={actionLabel} onPress={onAction} size="md" />
        </View>
      )}
    </View>
  );
}
