import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { StatusBanner } from '../components/StatusBanner';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../hooks/use-theme-color';
import { FontSize, FontWeight, Palette, Radius, Spacing } from '../constants/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const theme = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      await register({ firstName, lastName, phoneNumber, email, password });
      router.replace('/home');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
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
              Create account
            </Text>
            <Text
              style={{
                fontSize: FontSize.md,
                color: 'rgba(255,255,255,0.55)',
                marginTop: Spacing.xs,
              }}
            >
              Join the RESPONDR network
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
            {/* Name row */}
            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
              <View style={{ flex: 1 }}>
                <AppInput label="First Name" value={firstName} onChangeText={setFirstName} placeholder="Jane" />
              </View>
              <View style={{ flex: 1 }}>
                <AppInput label="Last Name" value={lastName} onChangeText={setLastName} placeholder="Doe" />
              </View>
            </View>

            <AppInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="+1 (555) 000-0000"
            />
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
              label="Create Account"
              onPress={handleRegister}
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
              Already have an account?{' '}
              <Link
                href="/login"
                style={{
                  color: theme.primary,
                  fontWeight: FontWeight.semibold,
                }}
              >
                Sign in
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
