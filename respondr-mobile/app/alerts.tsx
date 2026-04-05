import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { apiAuthRequest } from '../src/services/api';
import type { AlertItem } from '../src/types';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastNotificationTitle, setLastNotificationTitle] = useState('');

  const receivedSubscription = useRef<Notifications.EventSubscription | null>(null);

  const loadAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiAuthRequest<AlertItem[]>('/alerts?limit=50');
      setAlerts(Array.isArray(result) ? result : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load alerts';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();

    receivedSubscription.current = Notifications.addNotificationReceivedListener((event) => {
      const title = event.request.content.title || 'Push notification received';
      setLastNotificationTitle(title);
      loadAlerts();
    });

    return () => {
      if (receivedSubscription.current) {
        receivedSubscription.current.remove();
      }
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>Alerts Feed</Text>
        <Pressable onPress={loadAlerts} style={{ padding: 8, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 }}>
          <Text>Refresh</Text>
        </Pressable>
      </View>

      {lastNotificationTitle ? (
        <Text style={{ color: '#2563eb', marginBottom: 10 }}>Last push received: {lastNotificationTitle}</Text>
      ) : null}

      {error ? <Text style={{ color: '#dc2626', marginBottom: 10 }}>{error}</Text> : null}

      {!error && alerts.length === 0 ? (
        <Text style={{ color: '#4b5563' }}>No alerts yet.</Text>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
                backgroundColor: '#fff',
              }}
            >
              <Text style={{ fontWeight: '700', marginBottom: 4 }}>{item.title}</Text>
              <Text style={{ color: '#4b5563', marginBottom: 8 }}>{item.message}</Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {new Date(item.created_at).toLocaleString()} | {item.type}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
