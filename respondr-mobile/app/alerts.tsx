import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { apiAuthRequest } from '../src/services/api';
import type { ApiError } from '../src/services/api';
import type { AlertItem } from '../src/types';
import { StatusBanner } from '../components/StatusBanner';
import { useTheme } from '../hooks/use-theme-color';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../constants/theme';

// ── Alert type → accent color mapping ───────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  emergency: '#e63946',
  warning:   '#f59e0b',
  info:      '#3b82f6',
  update:    '#0f9d8a',
};

function getTypeColor(type: string, fallback: string) {
  return TYPE_COLORS[type?.toLowerCase()] ?? fallback;
}

// ── Alert card ───────────────────────────────────────────────────────────────
function AlertCard({ item }: { item: AlertItem }) {
  const theme = useTheme();
  const accent = getTypeColor(item.type, theme.primary);
  const dateString = new Date(item.created_at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderRadius: Radius.lg,
        marginBottom: Spacing.md,
        overflow: 'hidden',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: theme.border,
        ...Shadow.sm,
      }}
    >
      {/* Left accent strip */}
      <View style={{ width: 4, backgroundColor: accent }} />

      {/* Content */}
      <View style={{ flex: 1, padding: Spacing.lg }}>
        {/* Type badge + timestamp row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: Spacing.sm,
          }}
        >
          <View
            style={{
              backgroundColor: accent + '1a', // 10% opacity
              borderRadius: Radius.full,
              paddingHorizontal: Spacing.sm,
              paddingVertical: 3,
            }}
          >
            <Text
              style={{
                fontSize: FontSize.xs,
                fontWeight: FontWeight.bold,
                color: accent,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              {item.type}
            </Text>
          </View>
          <Text style={{ fontSize: FontSize.xs, color: theme.textMuted }}>{dateString}</Text>
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: FontSize.md,
            fontWeight: FontWeight.bold,
            color: theme.text,
            marginBottom: Spacing.xs,
            lineHeight: 22,
          }}
        >
          {item.title}
        </Text>

        {/* Message */}
        <Text
          style={{
            fontSize: FontSize.sm,
            color: theme.textSecondary,
            lineHeight: 20,
          }}
        >
          {item.message}
        </Text>
      </View>
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function AlertsScreen() {
  const theme = useTheme();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastNotificationTitle, setLastNotificationTitle] = useState('');

  const receivedSubscription = useRef<Notifications.EventSubscription | null>(null);

  const loadAlerts = async (mode: 'initial' | 'refresh' = 'refresh') => {
    if (mode === 'initial') setInitialLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    setError('');
    try {
      const result = await apiAuthRequest<AlertItem[]>('/alerts?limit=50');
      setAlerts(Array.isArray(result) ? result : []);
    } catch (err) {
      const errorPayload = err as ApiError | undefined;
      const message = errorPayload?.message || 'Failed to load alerts';
      setError(message);
    } finally {
      if (mode === 'initial') setInitialLoading(false);
      if (mode === 'refresh') setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts('initial');

    receivedSubscription.current = Notifications.addNotificationReceivedListener((event) => {
      const title = event.request.content.title || 'Push notification received';
      setLastNotificationTitle(title);
      loadAlerts('refresh');
    });

    return () => { receivedSubscription.current?.remove(); };
  }, []);

  if (initialLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} size="large" />
        <Text style={{ color: theme.textSecondary, marginTop: Spacing.md, fontSize: FontSize.sm }}>
          Loading alerts…
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* ── Toolbar ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          backgroundColor: theme.surface,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: FontSize.xl,
              fontWeight: FontWeight.extrabold,
              color: theme.text,
              letterSpacing: 0.2,
            }}
          >
            Alerts Feed
          </Text>
          <Text style={{ fontSize: FontSize.xs, color: theme.textSecondary, marginTop: 2 }}>
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <Pressable
          onPress={() => loadAlerts('refresh')}
          disabled={refreshing}
          style={({ pressed }) => ({
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: Radius.md,
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.xs,
            opacity: pressed || refreshing ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: FontSize.sm, color: theme.textSecondary, fontWeight: FontWeight.medium }}>
            {refreshing ? 'Refreshing…' : '↻ Refresh'}
          </Text>
        </Pressable>
      </View>

      {/* ── Banners ── */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingTop: lastNotificationTitle || error ? Spacing.md : 0 }}>
        {lastNotificationTitle ? (
          <StatusBanner
            message={`Push received: ${lastNotificationTitle}`}
            variant="info"
          />
        ) : null}
        {error ? <StatusBanner message={error} variant="error" /> : null}
      </View>

      {/* ── List ── */}
      {!error && alerts.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm }}>
          <Text style={{ fontSize: 36 }}>📭</Text>
          <Text style={{ color: theme.textSecondary, fontSize: FontSize.md, fontWeight: FontWeight.medium }}>
            No alerts yet
          </Text>
          <Text style={{ color: theme.textMuted, fontSize: FontSize.sm }}>
            Pull to refresh or wait for push notifications.
          </Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => loadAlerts('refresh')}
          contentContainerStyle={{
            paddingHorizontal: Spacing.xl,
            paddingTop: Spacing.lg,
            paddingBottom: Spacing['3xl'],
          }}
          renderItem={({ item }) => <AlertCard item={item} />}
        />
      )}
    </View>
  );
}
