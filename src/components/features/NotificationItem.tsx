import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, Calendar, CheckCircle, XCircle, MessageSquare } from 'lucide-react-native';
import type { Notification } from '../../api/notifications.api';
import { formatShortDate } from '../../utils/format';

const icons: Record<string, React.ComponentType<any>> = {
  BOOKING_CONFIRMED: CheckCircle,
  BOOKING_CANCELLED: XCircle,
  KYC_APPROVED: CheckCircle,
  KYC_REJECTED: XCircle,
  NEW_MESSAGE: MessageSquare,
};

const iconColors: Record<string, string> = {
  BOOKING_CONFIRMED: '#16a34a',
  BOOKING_CANCELLED: '#dc2626',
  KYC_APPROVED: '#16a34a',
  KYC_REJECTED: '#dc2626',
  NEW_MESSAGE: '#1a56db',
};

interface Props {
  notification: Notification;
  onPress: () => void;
}

export function NotificationItem({ notification, onPress }: Props) {
  const Icon = icons[notification.type] ?? Bell;
  const color = iconColors[notification.type] ?? '#6b7280';

  return (
    <TouchableOpacity
      className={`flex-row items-start gap-3 px-4 py-4 border-b border-gray-50 ${!notification.read ? 'bg-blue-50/40' : 'bg-white'}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="h-9 w-9 rounded-full bg-gray-100 items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={18} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-900">{notification.title}</Text>
        <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={2}>{notification.body}</Text>
        <Text className="text-xs text-gray-400 mt-1">{formatShortDate(notification.createdAt)}</Text>
      </View>
      {!notification.read && (
        <View className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
      )}
    </TouchableOpacity>
  );
}
