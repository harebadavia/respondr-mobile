import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../hooks/use-theme-color';
import {
  FontSize,
  FontWeight,
  Palette,
  Radius,
  Shadow,
  Spacing,
} from '../constants/theme';

// ── Placeholder report type ──────────────────────────────────────────────────
type ReportItem = {
  id: string;
  title: string;
  date: string;
  category: string;
  location: string;
};

const PLACEHOLDER_REPORTS: ReportItem[] = [
  { id: '1', title: 'Report Title', date: 'May 12, 2025', category: 'Flooding',       location: 'Everlasting st., Camella Homes' },
  { id: '2', title: 'Report Title', date: 'May 12, 2025', category: 'Infrastructure', location: 'Everlasting st., Camella Homes' },
  { id: '3', title: 'Report Title', date: 'May 12, 2025', category: 'Accident',       location: 'Everlasting st., Camella Homes' },
  { id: '4', title: 'Report Title', date: 'May 12, 2025', category: 'Theft',          location: 'Everlasting st., Camella Homes' },
  { id: '5', title: 'Report Title', date: 'May 12, 2025', category: 'Disturbance',    location: 'Everlasting st., Camella Homes' },
];

// ── Report card ──────────────────────────────────────────────────────────────
function ReportCard({ item }: { item: ReportItem }) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: theme.surface,
        borderRadius: Radius.lg,
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: theme.border,
        overflow: 'hidden',
        opacity: pressed ? 0.88 : 1,
        ...Shadow.sm,
      })}
    >
      <View style={{ flexDirection: 'row', padding: Spacing.md, gap: Spacing.md }}>
        {/* Thumbnail */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: Radius.md,
            backgroundColor: theme.surfaceMuted,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 22, color: theme.textMuted }}>🖼</Text>
        </View>

        {/* Meta */}
        <View style={{ flex: 1, paddingTop: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm }}>
            <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: theme.text, flex: 1 }} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={{ backgroundColor: theme.surfaceMuted, borderRadius: Radius.full, borderWidth: 1, borderColor: theme.border, paddingHorizontal: Spacing.sm, paddingVertical: 3 }}>
              <Text style={{ fontSize: FontSize.xs, color: theme.textSecondary, fontWeight: FontWeight.medium }}>
                {item.category}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: FontSize.sm, color: theme.textSecondary, marginTop: 2 }}>
            {item.date}
          </Text>
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: theme.border, marginHorizontal: Spacing.md }} />

      <View style={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: FontSize.xs, color: theme.textSecondary }}>Location: </Text>
        <Text style={{ fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: theme.text, flex: 1 }} numberOfLines={1}>
          {item.location}
        </Text>
      </View>
    </Pressable>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { backendUser, logout } = useAuth();
  const theme = useTheme();
  const [search, setSearch] = useState('');

  const initials =
    `${backendUser?.first_name?.[0] ?? ''}${backendUser?.last_name?.[0] ?? ''}`.toUpperCase();

  const filtered = PLACEHOLDER_REPORTS.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.headerBg} />

      {/* ── Edge-to-edge header: only bottom corners rounded ── */}
      <View
        style={{
          backgroundColor: theme.headerBg,
          // No top radius — flush to screen edges and status bar
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + Spacing.lg : 0,
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing.xl,
        }}
      >
        {/* Safe area spacer for iOS notch */}
        {Platform.OS === 'ios' && <SafeAreaView />}

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: FontSize.xl, color: Palette.white }}>
              Welcome,{' '}
              <Text style={{ fontWeight: FontWeight.extrabold }}>
                {backendUser?.first_name ?? 'Responder'}!
              </Text>
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Text style={{ fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)' }}>📍</Text>
              <Text style={{ fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)' }}>
                San Antonio 1,{' '}
                <Text style={{ fontWeight: FontWeight.bold, color: 'rgba(255,255,255,0.85)' }}>
                  Noveleta
                </Text>
              </Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end', gap: Spacing.sm }}>
            {/* Avatar */}
            <View
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
              {initials ? (
                <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Palette.white }}>
                  {initials}
                </Text>
              ) : (
                <Text style={{ fontSize: 22 }}>👤</Text>
              )}
            </View>

            <Pressable
              onPress={async () => {
                await logout();
                router.replace('/login');
              }}
              style={({ pressed }) => ({
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: Radius.full,
                paddingHorizontal: Spacing.md,
                paddingVertical: 6,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: FontSize.xs, color: Palette.white, fontWeight: FontWeight.semibold }}>
                Sign Out
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ── Content ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {/* MY REPORTS row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginHorizontal: Spacing.xl,
                marginTop: Spacing.xl,
                marginBottom: Spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: FontSize.sm,
                  fontWeight: FontWeight.extrabold,
                  color: theme.text,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                }}
              >
                My Reports
              </Text>
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

            {/* Search bar */}
            <View
              style={{
                marginHorizontal: Spacing.xl,
                marginBottom: Spacing.lg,
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
                value={search}
                onChangeText={setSearch}
                placeholder="Search"
                placeholderTextColor={theme.textMuted}
                style={{ flex: 1, fontSize: FontSize.md, color: theme.text, height: '100%' }}
              />
            </View>
          </>
        }
        renderItem={({ item }) => <ReportCard item={item} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: Spacing['3xl'] }}>
            <Text style={{ fontSize: 36 }}>📭</Text>
            <Text style={{ color: theme.textSecondary, marginTop: Spacing.sm, fontSize: FontSize.md }}>
              No reports found
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: Spacing['2xl'] }}
      />
    </View>
  );
}
