import { View, Text, TextInput, TextInputProps } from 'react-native';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, ...props }: Props) {
  return (
    <View className="gap-1.5">
      {label && <Text className="text-sm font-medium text-gray-700">{label}</Text>}
      <TextInput
        className={`border rounded-xl px-4 h-12 text-base text-gray-900 bg-white ${error ? 'border-red-400' : 'border-gray-200'}`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && <Text className="text-red-500 text-xs">{error}</Text>}
      {hint && !error && <Text className="text-gray-400 text-xs">{hint}</Text>}
    </View>
  );
}
