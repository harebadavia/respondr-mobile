import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { apiAuthRequest } from '../src/services/api';
import { app } from '../src/firebase';
import type { IncidentAttachment, IncidentDetail } from '../src/types';
import { useTheme } from '../hooks/use-theme-color';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../constants/theme';
import { StatusBanner } from '../components/StatusBanner';

const storage = getStorage(app);
const { width: SCREEN_W } = Dimensions.get('window');

// ── Types ────────────────────────────────────────────────────────────────────
type GalleryImage = {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatStatus(status: string) {
  return String(status || 'pending')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

type StatusStyle = { bg: string; text: string; dot: string };
function statusStyle(status: string): StatusStyle {
  const s = String(status || '').toLowerCase();
  if (s === 'resolved')    return { bg: '#dcfce7', text: '#166534', dot: '#16a34a' };
  if (s === 'rejected')    return { bg: '#fee2e2', text: '#991b1b', dot: '#e63946' };
  if (s === 'in_progress') return { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' };
  if (s === 'verified')    return { bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' };
  return { bg: '#e2e8f0', text: '#334155', dot: '#64748b' };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: theme.border,
        overflow: 'hidden',
        ...Shadow.sm,
      }}
    >
      {/* Section header strip */}
      <View
        style={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm + 2,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          backgroundColor: theme.surfaceMuted,
        }}
      >
        <Text
          style={{
            fontSize: FontSize.xs,
            fontWeight: FontWeight.bold,
            color: theme.textSecondary,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Text>
      </View>
      <View style={{ padding: Spacing.lg }}>{children}</View>
    </View>
  );
}

// ── Meta row ─────────────────────────────────────────────────────────────────
function MetaRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        gap: Spacing.lg,
      }}
    >
      <Text style={{ fontSize: FontSize.sm, color: theme.textSecondary, flexShrink: 0 }}>{label}</Text>
      <Text
        style={{
          fontSize: FontSize.sm,
          fontWeight: FontWeight.semibold,
          color: theme.text,
          textAlign: 'right',
          flex: 1,
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const theme = useTheme();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [expandedImage, setExpandedImage] = useState<GalleryImage | null>(null);

  const buildGalleryImages = useCallback(
    async (attachments: IncidentAttachment[]) => {
      const imageAttachments = (attachments || []).filter((a) =>
        String(a.mime_type || '').startsWith('image/')
      );
      const mapped = await Promise.all(
        imageAttachments.map(async (item) => {
          try {
            let url = item.file_url || '';
            if (!url && item.storage_path)
              url = await getDownloadURL(ref(storage, item.storage_path));
            if (!url) return null;
            return { id: item.id, url, fileName: item.file_name, mimeType: item.mime_type, sizeBytes: item.size_bytes } as GalleryImage;
          } catch {
            return null;
          }
        })
      );
      return mapped.filter((x): x is GalleryImage => Boolean(x));
    },
    []
  );

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!id) { setError('Missing incident id'); setLoading(false); return; }
      if (mode === 'initial') setLoading(true);
      else setRefreshing(true);
      setError('');
      try {
        const data = await apiAuthRequest<IncidentDetail>(`/incidents/${id}`);
        setIncident(data);
        setGalleryImages(await buildGalleryImages(data.attachments || []));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load incident details');
      } finally {
        if (mode === 'initial') setLoading(false);
        else setRefreshing(false);
      }
    },
    [buildGalleryImages, id]
  );

  useEffect(() => { load('initial'); }, [load]);

  // ── Loading ──
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background, gap: Spacing.md }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm }}>Loading report details…</Text>
      </View>
    );
  }

  // ── Error / not found ──
  if (error || !incident) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, padding: Spacing.xl }}>
        <StatusBanner message={error || 'Incident not found'} variant="error" />
      </View>
    );
  }

  const chip = statusStyle(incident.status);
  const category =
    incident.category_name ||
    incident.parent_category_name ||
    incident.incident_type ||
    'Uncategorized';

  return (
    <>
      {/* ── Hero / title block (fixed under nav header) ───────────────────── */}
      <View
        style={{
          backgroundColor: theme.headerBg,
          paddingTop: Spacing.lg,
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing['2xl'],
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          zIndex: 2,
        }}
      >
        {/* Status badge */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: chip.bg,
            alignSelf: 'flex-start',
            borderRadius: Radius.full,
            paddingHorizontal: Spacing.md,
            paddingVertical: 4,
            marginBottom: Spacing.md,
          }}
        >
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: chip.dot }} />
          <Text style={{ fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: chip.text, letterSpacing: 0.5 }}>
            {formatStatus(incident.status)}
          </Text>
        </View>

        <Text
          style={{
            fontSize: FontSize['2xl'],
            fontWeight: FontWeight.extrabold,
            color: '#ffffff',
            lineHeight: 32,
          }}
        >
          {incident.title}
        </Text>

        <Text
          style={{
            marginTop: Spacing.sm,
            color: 'rgba(255,255,255,0.60)',
            fontSize: FontSize.xs,
            letterSpacing: 0.3,
          }}
        >
          {new Date(incident.created_at).toLocaleString(undefined, {
            month: 'long', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ gap: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing['5xl'] }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load('refresh')}
            tintColor={theme.primary}
          />
        }
      >
        <View style={{ paddingHorizontal: Spacing.xl, gap: Spacing.lg }}>

          {/* ── Description ─────────────────────────────────────────────── */}
          <Section title="Description">
            <Text style={{ color: theme.text, fontSize: FontSize.md, lineHeight: 24 }}>
              {incident.description}
            </Text>
          </Section>

          {/* ── Details ─────────────────────────────────────────────────── */}
          <Section title="Incident Details">
            <MetaRow label="Category"    value={category} />
            <MetaRow label="Latitude"    value={String(incident.latitude)} />
            <MetaRow label="Longitude"   value={String(incident.longitude)} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: Spacing.sm,
                gap: Spacing.lg,
              }}
            >
              <Text style={{ fontSize: FontSize.sm, color: theme.textSecondary }}>Submitted</Text>
              <Text style={{ fontSize: FontSize.sm, color: theme.textMuted, textAlign: 'right', flex: 1 }}>
                {new Date(incident.created_at).toLocaleString()}
              </Text>
            </View>
          </Section>

          {/* ── Photo gallery ────────────────────────────────────────────── */}
          <Section title={`Photo Gallery${galleryImages.length ? ` · ${galleryImages.length}` : ''}`}>
            {galleryImages.length ? (
              <FlatList
                data={galleryImages}
                horizontal
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: Spacing.md }}
                scrollEnabled
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setExpandedImage(item)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
                  >
                    <Image
                      source={{ uri: item.url }}
                      style={{
                        width: 150,
                        height: 110,
                        borderRadius: Radius.md,
                        borderWidth: 1,
                        borderColor: theme.border,
                        backgroundColor: theme.surfaceMuted,
                      }}
                      resizeMode="cover"
                    />
                    <View style={{ marginTop: Spacing.xs, maxWidth: 150 }}>
                      <Text
                        numberOfLines={1}
                        style={{ color: theme.text, fontSize: FontSize.xs, fontWeight: FontWeight.semibold }}
                      >
                        {item.fileName}
                      </Text>
                      <Text style={{ color: theme.textMuted, fontSize: FontSize.xs }}>
                        {formatBytes(item.sizeBytes)}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm }}>
                <Text style={{ fontSize: 32 }}>📷</Text>
                <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm }}>
                  No photos attached
                </Text>
              </View>
            )}
          </Section>

          {/* ── Response timeline ────────────────────────────────────────── */}
          <Section title={`Response Timeline${incident.responses?.length ? ` · ${incident.responses.length}` : ''}`}>
            {incident.responses?.length ? (
              <View style={{ gap: 0 }}>
                {incident.responses.map((response, index) => {
                  const isLast = index === incident.responses.length - 1;
                  return (
                    <View key={response.id} style={{ flexDirection: 'row', gap: Spacing.md }}>
                      {/* Timeline spine */}
                      <View style={{ alignItems: 'center', width: 20 }}>
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: theme.primary,
                            marginTop: 4,
                            borderWidth: 2,
                            borderColor: theme.primaryBg,
                          }}
                        />
                        {!isLast && (
                          <View
                            style={{
                              width: 2,
                              flex: 1,
                              backgroundColor: theme.border,
                              marginTop: 4,
                              marginBottom: 4,
                            }}
                          />
                        )}
                      </View>

                      {/* Response card */}
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: theme.surfaceMuted,
                          borderRadius: Radius.md,
                          borderWidth: 1,
                          borderColor: theme.border,
                          padding: Spacing.md,
                          marginBottom: isLast ? 0 : Spacing.md,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs }}>
                          <Text style={{ color: theme.text, fontSize: FontSize.sm, fontWeight: FontWeight.bold }}>
                            {response.responded_by_first_name} {response.responded_by_last_name}
                          </Text>
                          <Text style={{ color: theme.textMuted, fontSize: FontSize.xs }}>
                            {new Date(response.created_at).toLocaleString(undefined, {
                              month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm, lineHeight: 20 }}>
                          {response.message}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm }}>
                <Text style={{ fontSize: 32 }}>🕐</Text>
                <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm }}>
                  No official responses yet
                </Text>
              </View>
            )}
          </Section>

        </View>
      </ScrollView>

      {/* ── Lightbox modal ──────────────────────────────────────────────── */}
      <Modal
        visible={Boolean(expandedImage)}
        transparent
        animationType="fade"
        onRequestClose={() => setExpandedImage(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.93)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Close button */}
          <Pressable
            onPress={() => setExpandedImage(null)}
            style={({ pressed }) => ({
              position: 'absolute',
              top: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 0) + 16,
              right: Spacing.xl,
              zIndex: 10,
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderRadius: Radius.full,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: FontWeight.bold, lineHeight: 18 }}>✕</Text>
          </Pressable>

          {expandedImage && (
            <>
              <Image
                source={{ uri: expandedImage.url }}
                style={{
                  width: SCREEN_W - Spacing.xl * 2,
                  height: (SCREEN_W - Spacing.xl * 2) * 0.75,
                  borderRadius: Radius.lg,
                  backgroundColor: '#1a1a1a',
                }}
                resizeMode="contain"
              />
              {/* Caption */}
              <View style={{ marginTop: Spacing.lg, alignItems: 'center', gap: 3 }}>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}>
                  {expandedImage.fileName}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: FontSize.xs }}>
                  {formatBytes(expandedImage.sizeBytes)}
                </Text>
              </View>
            </>
          )}
        </View>
      </Modal>
    </>
  );
}
