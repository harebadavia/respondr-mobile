import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Variant = 'primary' | 'secondary' | 'danger';

type AppButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
};

export function AppButton({ label, variant = 'primary', style, disabled, ...props }: AppButtonProps) {
  const theme = useColorScheme() ?? 'light';
  const palette = Colors[theme];

  const variantStyle = {
    primary: { backgroundColor: palette.tint, textColor: '#ffffff' },
    secondary: { backgroundColor: palette.card, textColor: palette.text },
    danger: { backgroundColor: palette.danger, textColor: '#ffffff' },
  }[variant];

  return (
    <Pressable
      style={[
        styles.base,
        { backgroundColor: variantStyle.backgroundColor, opacity: disabled ? 0.65 : 1, borderColor: palette.border },
        variant === 'secondary' && styles.secondaryBorder,
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      <Text style={[styles.label, { color: variantStyle.textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBorder: {
    borderWidth: 1,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
  },
});
