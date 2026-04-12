import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import type { Booking, BookingStatus } from '../../types/booking.types';
import { formatShortDate, formatPrice } from '../../utils/format';
import { Badge } from '../ui/Badge';

const statusLabel: Record<BookingStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  DISPUTED: 'Litige',
};

const statusVariant: Record<BookingStatus, 'info' | 'success' | 'warning' | 'muted' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  IN_PROGRESS: 'success',
  COMPLETED: 'muted',
  CANCELLED: 'danger',
  DISPUTED: 'danger',
};

interface Props {
  booking: Booking;
  onPress: () => void;
}

export function BookingCard({ booking, onPress }: Props) {
  return (
    <TouchableOpacity
      className="mx-4 mb-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="font-bold text-gray-900 text-sm" numberOfLines={1}>
            {booking.service.name}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            avec {booking.provider.user.name}
          </Text>
        </View>
        <Badge label={statusLabel[booking.status]} variant={statusVariant[booking.status]} />
      </View>

      <View className="flex-row items-center gap-4 mt-2">
        <View className="flex-row items-center gap-1.5">
          <Calendar size={13} color="#6b7280" />
          <Text className="text-xs text-gray-500">{formatShortDate(booking.scheduledDate)}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Clock size={13} color="#6b7280" />
          <Text className="text-xs text-gray-500">{booking.scheduledSlot}</Text>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-sm font-bold text-primary">{formatPrice(booking.totalAmount)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
