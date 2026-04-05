import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { AppInput } from '../components/AppInput';
import { useAuth } from '../src/context/AuthContext';
import { env } from '../src/config/env';

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
      console.warn('Login failed:', {
        error: err,
        apiBaseUrl: env.apiBaseUrl,
      });
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 26, fontWeight: '700', marginBottom: 20 }}>Welcome Back</Text>
      <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      {error ? <Text style={{ color: '#dc2626', marginBottom: 12 }}>{error}</Text> : null}

      <Pressable
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: '#0f766e',
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: 'center',
          marginTop: 8,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Login</Text>}
      </Pressable>

      <Text style={{ marginTop: 14, textAlign: 'center' }}>
        No account yet? <Link href="/register">Create one</Link>
      </Text>
    </View>
  );
}
