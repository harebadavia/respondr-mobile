import { Text, View } from 'react-native';
import { useTheme } from '../hooks/use-theme-color';
import { FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

type Variant = 'error' | 'success' | 'warning' | 'info';

type Props = {
  message: string;
  variant?: Variant;
};

const icons: Record<Variant, string> = {
  error:   '⚠',
  success: '✓',
  warning: '!',
  info:    'ℹ',
};

export function StatusBanner({ message, variant = 'error' }: Props) {
  const theme = useTheme();

  const bgKey   = `${variant}Bg`  as keyof typeof theme;
  const fgKey   = variant          as keyof typeof theme;

  const bg  = theme[bgKey]  as string;
  const fg  = theme[fgKey]  as string;

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: Radius.md,
        borderLeftWidth: 3,
        borderLeftColor: fg,
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
      }}
    >
      <Text style={{ color: fg, fontSize: FontSize.md, fontWeight: FontWeight.bold, lineHeight: 20 }}>
        {icons[variant]}
      </Text>
      <Text style={{ color: fg, fontSize: FontSize.sm, fontWeight: FontWeight.medium, flex: 1, lineHeight: 20 }}>
        {message}
      </Text>
    </View>
  );
}
