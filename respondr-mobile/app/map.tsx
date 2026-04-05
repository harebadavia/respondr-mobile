import { View, Text } from 'react-native';
import { useTheme } from '../hooks/use-theme-color';
import { FontSize, FontWeight, Spacing } from '../constants/theme';

export default function MapScreen() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm }}>
      <Text style={{ fontSize: 48 }}>🗺️</Text>
      <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: theme.text }}>
        Map View
      </Text>
      <Text style={{ fontSize: FontSize.sm, color: theme.textSecondary }}>
        Coming soon
      </Text>
    </View>
  );
}
