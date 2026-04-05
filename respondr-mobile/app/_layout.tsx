import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="register" options={{ title: 'Register' }} />
        <Stack.Screen name="home" options={{ title: 'RESPONDR Mobile' }} />
        <Stack.Screen name="incident-create" options={{ title: 'Report Incident' }} />
        <Stack.Screen name="alerts" options={{ title: 'Alerts Feed' }} />
      </Stack>
    </AuthProvider>
  );
}
