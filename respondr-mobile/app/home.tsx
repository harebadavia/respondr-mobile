import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';

export default function HomeScreen() {
  const { backendUser, logout } = useAuth();

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 6 }}>RESPONDR Mobile</Text>
      <Text style={{ color: '#4b5563', marginBottom: 20 }}>
        Signed in as {backendUser?.first_name} {backendUser?.last_name}
      </Text>

      <Pressable
        onPress={() => router.push('/incident-create')}
        style={{ backgroundColor: '#0f766e', padding: 14, borderRadius: 10, marginBottom: 12 }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>Report Incident</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/alerts')}
        style={{ backgroundColor: '#1d4ed8', padding: 14, borderRadius: 10, marginBottom: 12 }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>View Alerts</Text>
      </Pressable>

      <Pressable
        onPress={async () => {
          await logout();
          router.replace('/login');
        }}
        style={{ borderColor: '#dc2626', borderWidth: 1, padding: 14, borderRadius: 10 }}
      >
        <Text style={{ color: '#dc2626', fontWeight: '700', textAlign: 'center' }}>Logout</Text>
      </Pressable>
    </View>
  );
}
