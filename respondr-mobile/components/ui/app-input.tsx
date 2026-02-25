import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function AppInput({ label, error, style, ...props }: AppInputProps) {
  const theme = useColorScheme() ?? 'light';
  const palette = Colors[theme];

  return (
    <View style={styles.group}>
      {label && <Text style={[styles.label, { color: palette.muted }]}>{label}</Text>}
      <TextInput
        placeholderTextColor={palette.icon}
        style={[
          styles.input,
          {
            color: palette.text,
            borderColor: error ? palette.danger : palette.border,
            backgroundColor: palette.card,
          },
          style,
        ]}
        {...props}
      />
      {error && <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing[1],
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    fontSize: 14,
  },
  error: {
    fontSize: 12,
    fontWeight: '500',
  },
});
