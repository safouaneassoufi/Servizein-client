import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface Props extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-primary',
  outline: 'bg-transparent border border-primary',
  ghost: 'bg-transparent',
  danger: 'bg-red-600',
};

const labelVariants = {
  primary: 'text-white font-semibold',
  outline: 'text-primary font-semibold',
  ghost: 'text-primary font-semibold',
  danger: 'text-white font-semibold',
};

const sizes = {
  sm: 'h-9 px-4',
  md: 'h-11 px-5',
  lg: 'h-13 px-6',
};

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
};

export function Button({
  label, variant = 'primary', size = 'lg', loading = false, fullWidth = true, disabled, ...props
}: Props) {
  return (
    <TouchableOpacity
      className={`rounded-xl items-center justify-center ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-60' : ''}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : '#1a56db'} />
        : <Text className={`${labelVariants[variant]} ${textSizes[size]}`}>{label}</Text>
      }
    </TouchableOpacity>
  );
}
