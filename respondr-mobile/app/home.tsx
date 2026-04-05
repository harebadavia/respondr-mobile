import { router } from 'expo-router';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../hooks/use-theme-color';
import { AppButton } from '../components/AppButton';
import { FontSize, FontWeight, Palette, Radius, Shadow, Spacing } from '../constants/theme';

export default function HomeScreen() {
  const { backendUser, logout } = useAuth();
  const theme = useTheme();

  const initials =
    `${backendUser?.first_name?.[0] ?? ''}${backendUser?.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.headerBg }}>
      {/* ── Header bar ── */}
      <View
        style={{
          backgroundColor: theme.headerBg,
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing['2xl'],
          paddingBottom: Spacing['2xl'],
        }}
      >
        <Text
          style={{
            fontSize: FontSize['4xl'],
            fontWeight: FontWeight.extrabold,
            color: Palette.white,
            letterSpacing: 3,
          }}
        >
          RESPONDR
        </Text>
        <View
          style={{
            marginTop: Spacing.xs,
            width: 32,
            height: 3,
            backgroundColor: theme.primary,
            borderRadius: Radius.full,
          }}
        />
      </View>

      {/* ── Body ── */}
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          borderTopLeftRadius: Radius.xl,
          borderTopRightRadius: Radius.xl,
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing['2xl'],
        }}
      >
        {/* User greeting */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.md,
            marginBottom: Spacing['3xl'],
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: Radius.full,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: Palette.white,
                fontSize: FontSize.md,
                fontWeight: FontWeight.bold,
              }}
            >
              {initials}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: FontSize.xs, color: theme.textSecondary, fontWeight: FontWeight.medium, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Signed in as
            </Text>
            <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: theme.text }}>
              {backendUser?.first_name} {backendUser?.last_name}
            </Text>
          </View>
        </View>

        {/* Action cards */}
        <ActionCard
          label="Report Incident"
          description="Submit a new incident report with location and photo"
          accentColor={theme.primary}
          iconBg={theme.primaryBg}
          icon="🚨"
          onPress={() => router.push('/incident-create')}
        />

        <ActionCard
          label="View Alerts"
          description="Browse the live alerts feed for your area"
          accentColor={theme.secondary}
          iconBg={theme.secondaryBg}
          icon="📡"
          onPress={() => router.push('/alerts')}
        />

        {/* Spacer pushes logout to bottom */}
        <View style={{ flex: 1 }} />

        <AppButton
          label="Sign Out"
          onPress={async () => {
            await logout();
            router.replace('/login');
          }}
          variant="outline"
          style={{ marginBottom: Spacing.xl }}
        />
      </View>
    </SafeAreaView>
  );
}

// ── Local sub-component ──────────────────────────────────────────────────────
type ActionCardProps = {
  label: string;
  description: string;
  accentColor: string;
  iconBg: string;
  icon: string;
  onPress: () => void;
};

function ActionCard({ label, description, accentColor, iconBg, icon, onPress }: ActionCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: theme.surface,
        borderRadius: Radius.lg,
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.lg,
        borderWidth: 1,
        borderColor: theme.border,
        opacity: pressed ? 0.85 : 1,
        ...Shadow.md,
      })}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: Radius.md,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: FontSize.lg,
            fontWeight: FontWeight.bold,
            color: theme.text,
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
        <Text style={{ fontSize: FontSize.sm, color: theme.textSecondary, lineHeight: 18 }}>
          {description}
        </Text>
      </View>
      <Text style={{ fontSize: FontSize.lg, color: accentColor }}>›</Text>
    </Pressable>
  );
}
