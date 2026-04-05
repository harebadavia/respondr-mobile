import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '../hooks/use-theme-color';
import { FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
};

export function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  keyboardType = 'default',
}: Props) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <Text
        style={{
          marginBottom: Spacing.xs,
          fontSize: FontSize.sm,
          fontWeight: FontWeight.semibold,
          color: theme.textSecondary,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          borderWidth: focused ? 1.5 : 1,
          borderColor: focused ? theme.primary : theme.border,
          borderRadius: Radius.md,
          paddingHorizontal: Spacing.lg,
          paddingVertical: multiline ? Spacing.md : 0,
          minHeight: multiline ? 96 : 50,
          textAlignVertical: multiline ? 'top' : 'center',
          fontSize: FontSize.md,
          color: theme.text,
          backgroundColor: theme.surface,
          fontWeight: FontWeight.normal,
        }}
      />
    </View>
  );
}
