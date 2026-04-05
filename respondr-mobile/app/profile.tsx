import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../hooks/use-theme-color';
import { FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

export default function ProfileScreen() {
  const { backendUser, logout } = useAuth();
  const theme = useTheme();

  const initials = `${backendUser?.first_name?.[0] ?? ''}${backendUser?.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: Spacing.xl }}>
      <View
        style={{
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: Radius.lg,
          padding: Spacing.xl,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: Radius.full,
            backgroundColor: theme.primaryBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.md,
          }}
        >
          <Text style={{ color: theme.primary, fontWeight: FontWeight.bold, fontSize: FontSize.md }}>
            {initials || '👤'}
          </Text>
        </View>

        <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: theme.text }}>
          {backendUser?.first_name} {backendUser?.last_name}
        </Text>
        <Text style={{ marginTop: 4, color: theme.textSecondary, fontSize: FontSize.sm }}>
          {backendUser?.email}
        </Text>
        <Text style={{ marginTop: 2, color: theme.textMuted, fontSize: FontSize.xs, textTransform: 'uppercase' }}>
          {backendUser?.role}
        </Text>
      </View>

      <Pressable
        onPress={async () => {
          await logout();
          router.replace('/login');
        }}
        style={({ pressed }) => ({
          marginTop: Spacing.xl,
          backgroundColor: theme.headerBg,
          borderRadius: Radius.full,
          paddingVertical: Spacing.md,
          alignItems: 'center',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ color: '#fff', fontWeight: FontWeight.semibold, fontSize: FontSize.sm }}>
          Sign Out
        </Text>
      </Pressable>
    </View>
  );
}
