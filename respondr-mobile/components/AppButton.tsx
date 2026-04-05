import { ActivityIndicator, Pressable, Text, ViewStyle } from 'react-native';
import { useTheme } from '../hooks/use-theme-color';
import { FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  fullWidth = true,
}: Props) {
  const theme = useTheme();

  const styles: Record<Variant, { bg: string; text: string; border?: string }> = {
    primary:   { bg: theme.primary,    text: theme.textInverse },
    secondary: { bg: theme.secondary,  text: theme.textInverse },
    outline:   { bg: 'transparent',    text: theme.primary,   border: theme.primary },
    ghost:     { bg: 'transparent',    text: theme.textSecondary },
    danger:    { bg: theme.error,      text: theme.textInverse },
  };

  const s = styles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          backgroundColor: s.bg,
          borderRadius: Radius.md,
          paddingVertical: Spacing.lg - 2,
          paddingHorizontal: Spacing.xl,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          flexDirection: 'row' as const,
          gap: Spacing.sm,
          borderWidth: s.border ? 1.5 : 0,
          borderColor: s.border,
          opacity: isDisabled ? 0.55 : pressed ? 0.82 : 1,
          minHeight: 50,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={s.text} size="small" />
      ) : (
        <Text
          style={{
            color: s.text,
            fontSize: FontSize.md,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
