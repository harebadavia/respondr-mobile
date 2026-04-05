import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { apiAuthRequest } from '../src/services/api';
import type { AnnouncementItem } from '../src/types';
import { useTheme } from '../hooks/use-theme-color';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../constants/theme';
import { StatusBanner } from '../components/StatusBanner';

function AnnouncementCard({ item }: { item: AnnouncementItem }) {
  const theme = useTheme();
  const dateString = new Date(item.created_at).toLocaleString();

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderRadius: Radius.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: theme.border,
        padding: Spacing.lg,
        ...Shadow.sm,
      }}
    >
      <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: theme.text }}>
        {item.title}
      </Text>
      <Text style={{ marginTop: Spacing.xs, fontSize: FontSize.sm, color: theme.textSecondary, lineHeight: 20 }}>
        {item.content}
      </Text>
      <Text style={{ marginTop: Spacing.sm, fontSize: FontSize.xs, color: theme.textMuted }}>
        {dateString}
      </Text>
    </View>
  );
}

export default function AnnouncementsScreen() {
  const theme = useTheme();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadAnnouncements = async (mode: 'initial' | 'refresh' = 'refresh') => {
    if (mode === 'initial') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    setError('');
    try {
      const data = await apiAuthRequest<AnnouncementItem[]>('/announcements');
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load announcements';
      setError(message);
    } finally {
      if (mode === 'initial') setLoading(false);
      if (mode === 'refresh') setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnnouncements('initial');
  }, []);

  const filteredAnnouncements = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return announcements;
    return announcements.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q)
    );
  }, [announcements, query]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} size="large" />
        <Text style={{ color: theme.textSecondary, marginTop: Spacing.md, fontSize: FontSize.sm }}>
          Loading announcements...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {!error && filteredAnnouncements.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm }}>
          <Text style={{ fontSize: 36 }}>📢</Text>
          <Text style={{ color: theme.textSecondary, fontSize: FontSize.md, fontWeight: FontWeight.medium }}>
            No announcements yet
          </Text>
          <Text style={{ color: theme.textMuted, fontSize: FontSize.sm }}>
            Pull to refresh and check again later.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAnnouncements}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => loadAnnouncements('refresh')}
          ListHeaderComponent={
            <View style={{ marginTop: Spacing.xl, marginBottom: Spacing.lg, gap: Spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.extrabold, color: theme.text, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                    Announcements
                  </Text>
                  <View
                    style={{
                      backgroundColor: theme.primaryBg,
                      borderRadius: Radius.full,
                      paddingHorizontal: Spacing.sm,
                      paddingVertical: 2,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Text style={{ fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: theme.primary }}>
                      {announcements.length}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => loadAnnouncements('refresh')}
                  disabled={refreshing}
                  style={({ pressed }) => ({
                    backgroundColor: theme.headerBg,
                    borderRadius: Radius.full,
                    paddingVertical: Spacing.sm,
                    paddingHorizontal: Spacing.lg,
                    opacity: pressed || refreshing ? 0.8 : 1,
                  })}
                >
                  <Text style={{ color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}>
                    {refreshing ? 'Refreshing…' : 'Refresh'}
                  </Text>
                </Pressable>
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
                  placeholder="Search announcements"
                  placeholderTextColor={theme.textMuted}
                  style={{ flex: 1, fontSize: FontSize.md, color: theme.text, height: '100%' }}
                />
              </View>

              {error ? <StatusBanner message={error} variant="error" /> : null}
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: Spacing.xl,
            paddingBottom: Spacing['3xl'],
          }}
          renderItem={({ item }) => <AnnouncementCard item={item} />}
        />
      )}
    </View>
  );
}
