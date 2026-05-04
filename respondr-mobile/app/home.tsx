import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { apiAuthRequest } from '../src/services/api';
import type { IncidentSummary } from '../src/types';
import { useTheme } from '../hooks/use-theme-color';
import { FontSize, FontWeight, Palette, Radius, Shadow, Spacing } from '../constants/theme';
import { StatusBanner } from '../components/StatusBanner';

function formatStatus(status: string) {
  return String(status || 'pending').replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function statusColors(status: string) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'resolved') return { bg: '#dcfce7', text: '#166534' };
  if (normalized === 'rejected') return { bg: '#fee2e2', text: '#991b1b' };
  if (normalized === 'in_progress') return { bg: '#fef3c7', text: '#92400e' };
  if (normalized === 'verified') return { bg: '#dbeafe', text: '#1d4ed8' };
  return { bg: '#e2e8f0', text: '#334155' };
}

function ReportCard({ item }: { item: IncidentSummary }) {
  const theme = useTheme();
  const chip = statusColors(item.status);
  const category = item.category_name || item.parent_category_name || item.incident_type || 'Uncategorized';

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/incident-detail', params: { id: item.id } })}
      style={({ pressed }) => ({
        backgroundColor: theme.surface,
        borderRadius: Radius.lg,
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: theme.border,
        padding: Spacing.lg,
        opacity: pressed ? 0.88 : 1,
        ...Shadow.sm,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm }}>
        <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: theme.text, flex: 1 }} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={{ backgroundColor: chip.bg, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 }}>
          <Text style={{ color: chip.text, fontSize: FontSize.xs, fontWeight: FontWeight.bold }}>{formatStatus(item.status)}</Text>
        </View>
      </View>

      <Text style={{ marginTop: Spacing.xs, color: theme.textSecondary, fontSize: FontSize.sm }} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={{ marginTop: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md }}>
        <Text style={{ color: theme.textSecondary, fontSize: FontSize.xs }} numberOfLines={1}>
          {category}
        </Text>
        <Text style={{ color: theme.textMuted, fontSize: FontSize.xs }} numberOfLines={1}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { backendUser, isAuthenticated } = useAuth();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [reports, setReports] = useState<IncidentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const initials = `${backendUser?.first_name?.[0] ?? ''}${backendUser?.last_name?.[0] ?? ''}`.toUpperCase();

  const getErrorMessage = (err: unknown) => {
    if (err && typeof err === 'object' && 'message' in err) {
      const message = (err as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) return message;
    }
    if (err instanceof Error && err.message.trim()) return err.message;
    return 'Failed to load reports';
  };

  const loadReports = async (mode: 'initial' | 'refresh' = 'refresh') => {
    if (mode === 'initial') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    setError('');
    try {
      const data = await apiAuthRequest<IncidentSummary[]>('/incidents/my');
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      if (mode === 'initial') setLoading(false);
      if (mode === 'refresh') setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setReports([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    loadReports('initial');
  }, [isAuthenticated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) => {
      const category = `${r.parent_category_name || ''} ${r.category_name || ''} ${r.incident_type || ''}`.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || category.includes(q);
    });
  }, [query, reports]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.headerBg} />

      <View
        style={{
          backgroundColor: theme.headerBg,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          paddingTop:
            Platform.OS === 'android'
              ? (StatusBar.currentHeight ?? 0) + Spacing['2xl']
              : Spacing['2xl'],
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing.xl,
        }}
      >
        {Platform.OS === 'ios' && <SafeAreaView />}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: FontSize.xl, color: Palette.white }}>
              Welcome, <Text style={{ fontWeight: FontWeight.extrabold }}>{backendUser?.first_name ?? 'Responder'}!</Text>
            </Text>
            <Text style={{ fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
              Resident Reports
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: Spacing.sm }}>
            <Pressable
              onPress={() => router.push('/profile')}
              style={{
                width: 48,
                height: 48,
                borderRadius: Radius.full,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderWidth: 1.5,
                borderColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Palette.white }}>
                {initials || '👤'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={() => loadReports('refresh')}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ marginHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.lg, gap: Spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.extrabold, color: theme.text, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                My Reports
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <Pressable
                  disabled={loading || refreshing}
                  onPress={() => loadReports('refresh')}
                  style={({ pressed }) => ({
                    backgroundColor: theme.surface,
                    borderRadius: Radius.full,
                    borderWidth: 1,
                    borderColor: theme.border,
                    paddingVertical: Spacing.sm,
                    paddingHorizontal: Spacing.lg,
                    opacity: pressed || loading || refreshing ? 0.7 : 1,
                  })}
                >
                  <Text style={{ color: theme.text, fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}>
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/incident-create')}
                  style={({ pressed }) => ({
                    backgroundColor: theme.headerBg,
                    borderRadius: Radius.full,
                    paddingVertical: Spacing.sm,
                    paddingHorizontal: Spacing.lg,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ color: Palette.white, fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}>
                    File a report
                  </Text>
                </Pressable>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.surface,
                borderRadius: Radius.full,
                borderWidth: 1,
                borderColor: theme.border,
                paddingHorizontal: Spacing.lg,
                height: 46,
                gap: Spacing.sm,
              }}
            >
              <Text style={{ fontSize: FontSize.md, color: theme.textMuted }}>🔍</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search reports"
                placeholderTextColor={theme.textMuted}
                style={{ flex: 1, fontSize: FontSize.md, color: theme.text, height: '100%' }}
              />
            </View>

            {error ? <StatusBanner message={error} variant="error" /> : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ alignItems: 'center', paddingTop: Spacing['3xl'] }}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={{ marginTop: Spacing.sm, color: theme.textSecondary }}>Loading reports...</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingTop: Spacing['3xl'] }}>
              <Text style={{ fontSize: 36 }}>📭</Text>
              <Text style={{ color: theme.textSecondary, marginTop: Spacing.sm, fontSize: FontSize.md }}>
                No reports found
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => <ReportCard item={item} />}
        contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}
      />
    </View>
  );
}
