import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { StatusBanner } from '../components/StatusBanner';
import { useAuth } from '../src/context/AuthContext';
import { env } from '../src/config/env';
import { useTheme } from '../hooks/use-theme-color';
import { FontSize, FontWeight, Palette, Radius, Spacing } from '../constants/theme';

type ErrorLike = {
  message?: string;
  status?: number;
  requestUrl?: string;
  rawError?: string;
  code?: string;
};

function formatError(err: unknown) {
  if (err && typeof err === 'object') {
    const e = err as ErrorLike;
    if (
      typeof e.message === 'string' &&
      e.message.toLowerCase().includes('network request failed')
    ) {
      const target = e.requestUrl || env.apiBaseUrl || 'your API URL';
      return `Cannot reach backend at ${target}. Ensure backend is running and EXPO_PUBLIC_API_BASE_URL uses your current LAN IP.`;
    }
    if (e.code === 'USER_REGISTRATION_INCOMPLETE') {
      return 'Your account is not fully registered in RESPONDR yet. Please create an account from Register first.';
    }
    if (typeof e.message === 'string' && e.message.trim()) {
      return e.message;
    }
  }

  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }

  return 'Login failed. Please check your network and try again.';
}

export default function LoginScreen() {
  const { login } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/home');
    } catch (err) {
      console.warn('Login failed:', { error: err, apiBaseUrl: env.apiBaseUrl });
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.headerBg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Brand header ── */}
          <View
            style={{
              backgroundColor: theme.headerBg,
              paddingHorizontal: Spacing.xl,
              paddingTop: Spacing['3xl'],
              paddingBottom: Spacing['3xl'],
              alignItems: 'flex-start',
            }}
          >
            <View
              style={{
                backgroundColor: theme.primary,
                borderRadius: Radius.sm,
                paddingHorizontal: Spacing.sm + 2,
                paddingVertical: 3,
                marginBottom: Spacing.md,
              }}
            >
              <Text
                style={{
                  color: Palette.white,
                  fontSize: FontSize.xs,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
              >
                RESPONDR
              </Text>
            </View>
            <Text
              style={{
                fontSize: FontSize['3xl'],
                fontWeight: FontWeight.extrabold,
                color: Palette.white,
                letterSpacing: 0.2,
              }}
            >
              Welcome back
            </Text>
            <Text
              style={{
                fontSize: FontSize.md,
                color: 'rgba(255,255,255,0.55)',
                marginTop: Spacing.xs,
              }}
            >
              Sign in to continue
            </Text>
          </View>

          {/* ── Form card ── */}
          <View
            style={{
              flex: 1,
              backgroundColor: theme.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: Spacing.xl,
              paddingTop: Spacing['2xl'],
              paddingBottom: Spacing['3xl'],
            }}
          >
            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="you@example.com"
            />
            <AppInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />

            {error ? <StatusBanner message={error} variant="error" /> : null}

            <AppButton
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: Spacing.sm }}
            />

            <Text
              style={{
                marginTop: Spacing.xl,
                textAlign: 'center',
                fontSize: FontSize.sm,
                color: theme.textSecondary,
              }}
            >
              No account yet?{' '}
              <Link
                href="/register"
                style={{
                  color: theme.primary,
                  fontWeight: FontWeight.semibold,
                }}
              >
                Create one
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
