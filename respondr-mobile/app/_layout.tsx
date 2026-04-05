import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { Colors, FontWeight } from '../constants/theme';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme as keyof typeof Colors];

  const headerStyle = {
    backgroundColor: theme.headerBg,
  } as const;

  const headerTitleStyle = {
    color: theme.headerText,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  } as const;

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle,
          headerTitleStyle,
          headerTintColor: theme.headerTint,
          headerBackTitle: 'Back',
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="index"           options={{ headerShown: false }} />
        <Stack.Screen name="login"           options={{ title: 'Sign In' }} />
        <Stack.Screen name="register"        options={{ title: 'Create Account' }} />
        <Stack.Screen name="home"            options={{ title: 'RESPONDR', headerShown: false }} />
        <Stack.Screen name="incident-create" options={{ title: 'Report Incident' }} />
        <Stack.Screen name="alerts"          options={{ title: 'Alerts Feed' }} />
      </Stack>
    </AuthProvider>
  );
}
