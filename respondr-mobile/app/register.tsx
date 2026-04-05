import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text } from 'react-native';
import { AppInput } from '../components/AppInput';
import { useAuth } from '../src/context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
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
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 26, fontWeight: '700', marginBottom: 20 }}>Create Account</Text>
      <AppInput label="First Name" value={firstName} onChangeText={setFirstName} />
      <AppInput label="Last Name" value={lastName} onChangeText={setLastName} />
      <AppInput label="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
      <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      {error ? <Text style={{ color: '#dc2626', marginBottom: 12 }}>{error}</Text> : null}

      <Pressable
        onPress={handleRegister}
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
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '700' }}>Register</Text>
        )}
      </Pressable>

      <Text style={{ marginTop: 14, textAlign: 'center' }}>
        Already have an account? <Link href="/login">Login</Link>
      </Text>
    </ScrollView>
  );
}
