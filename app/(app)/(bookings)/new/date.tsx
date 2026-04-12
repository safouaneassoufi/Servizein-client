import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { ScreenHeader } from '../../../../src/components/ui/ScreenHeader';
import { Button } from '../../../../src/components/ui/Button';
import { LoadingSpinner } from '../../../../src/components/ui/LoadingSpinner';
import { useBookingStore } from '../../../../src/store/booking.store';
import { useMonthlyAvailability, useDailySlots } from '../../../../src/hooks/useBooking';
import { formatDate } from '../../../../src/utils/format';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function BookingDateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { draft, setDate, setSlot } = useBookingStore();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(draft.selectedDate);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(draft.selectedSlot);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;
  const providerId = draft.provider?.id ?? '';

  const { data: monthly, isLoading: loadingMonth } = useMonthlyAvailability(providerId, year, month);
  const { data: daily, isLoading: loadingSlots } = useDailySlots(providerId, selectedDate);

  const availabilityMap = Object.fromEntries(
    (monthly?.days ?? []).map((d) => [d.date, d.available])
  );

  const daysInMonth = getDaysInMonth(viewDate);
  const firstDayOfWeek = startOfMonth(viewDate).getDay();

  const handleContinue = () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert('', 'Sélectionnez une date et un créneau');
      return;
    }
    setDate(selectedDate);
    setSlot(selectedSlot);
    router.push('/(app)/(bookings)/new/address');
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScreenHeader title="Choisir une date" subtitle={draft.service?.name} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* Month navigator */}
        <View className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3 mb-3 border border-gray-100">
          <TouchableOpacity onPress={() => setViewDate(subMonths(viewDate, 1))}>
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="font-bold text-gray-900 capitalize">
            {format(viewDate, 'MMMM yyyy', { locale: fr })}
          </Text>
          <TouchableOpacity onPress={() => setViewDate(addMonths(viewDate, 1))}>
            <ChevronRight size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          {/* Day names */}
          <View className="flex-row mb-2">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((d) => (
              <Text key={d} className="flex-1 text-center text-xs text-gray-400 font-medium">{d}</Text>
            ))}
          </View>

          {loadingMonth ? <LoadingSpinner /> : (
            <View className="flex-row flex-wrap">
              {/* Empty cells for first week offset */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <View key={`empty-${i}`} className="w-[14.28%] h-10" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isAvailable = availabilityMap[dateStr] === true;
                const isSelected = selectedDate === dateStr;
                const isPast = new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <TouchableOpacity
                    key={day}
                    className={`w-[14.28%] h-10 items-center justify-center rounded-xl ${
                      isSelected ? 'bg-primary' :
                      isPast || !isAvailable ? 'opacity-30' : ''
                    }`}
                    onPress={() => {
                      if (!isPast && isAvailable) {
                        setSelectedDate(dateStr);
                        setSelectedSlot(null);
                      }
                    }}
                    disabled={isPast || !isAvailable}
                  >
                    <Text className={`text-sm ${isSelected ? 'text-white font-bold' : 'text-gray-800'}`}>{day}</Text>
                    {isAvailable && !isPast && !isSelected && (
                      <View className="h-1 w-1 rounded-full bg-primary mt-0.5" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Time slots */}
        {selectedDate && (
          <View className="bg-white rounded-2xl border border-gray-100 p-4">
            <Text className="font-bold text-gray-900 mb-3 text-sm">
              Créneaux — {formatDate(selectedDate)}
            </Text>
            {loadingSlots ? <LoadingSpinner /> : (
              <View className="flex-row flex-wrap gap-2">
                {daily?.slots.map((slot) => (
                  <TouchableOpacity
                    key={slot.time}
                    className={`px-4 py-2.5 rounded-xl border ${
                      selectedSlot === slot.time ? 'bg-primary border-primary' :
                      slot.available ? 'bg-white border-gray-200' :
                      'bg-gray-50 border-gray-100 opacity-40'
                    }`}
                    onPress={() => slot.available && setSelectedSlot(slot.time)}
                    disabled={!slot.available}
                  >
                    <Text className={`text-sm font-semibold ${selectedSlot === slot.time ? 'text-white' : slot.available ? 'text-gray-800' : 'text-gray-400'}`}>
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                ))}
                {daily?.slots.length === 0 && (
                  <Text className="text-sm text-gray-400 py-2">Aucun créneau disponible</Text>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3" style={{ paddingBottom: insets.bottom + 8 }}>
        <Button label="Continuer" onPress={handleContinue} disabled={!selectedDate || !selectedSlot} />
      </View>
    </View>
  );
}
