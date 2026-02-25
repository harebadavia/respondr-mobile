import { StyleSheet, View, type ViewProps } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function AppCard({ style, ...props }: ViewProps) {
  const theme = useColorScheme() ?? 'light';
  const palette = Colors[theme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing[4],
  },
});
