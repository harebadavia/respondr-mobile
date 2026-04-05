import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { StatusBanner } from '../components/StatusBanner';
import { apiAuthRequest } from '../src/services/api';
import type { IncidentCategory } from '../src/types';
import { useTheme } from '../hooks/use-theme-color';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../constants/theme';

type Coordinates = { latitude: number; longitude: number };
type SelectedPhoto = {
  uri: string;
  fileName: string;
  mimeType: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
};
type CreatedIncident = { id: string };

function flattenSubcategories(categories: IncidentCategory[]) {
  const out: IncidentCategory[] = [];
  for (const parent of categories) {
    if (Array.isArray(parent.subcategories)) {
      for (const sub of parent.subcategories) out.push(sub);
    }
  }
  return out;
}

// ── Section label component ──────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Text
      style={{
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: theme.textSecondary,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: Spacing.sm,
        marginTop: Spacing.xs,
      }}
    >
      {children}
    </Text>
  );
}

// ── Capture button component ─────────────────────────────────────────────────
type CaptureButtonProps = {
  onPress: () => void;
  captured: boolean;
  capturedLabel: string;
  defaultLabel: string;
  icon: string;
  accentColor?: string;
};

function CaptureButton({ onPress, captured, capturedLabel, defaultLabel, icon, accentColor }: CaptureButtonProps) {
  const theme = useTheme();
  const bg = captured ? theme.secondaryBg : theme.surface;
  const border = captured ? theme.secondary : theme.border;
  const textColor = captured ? theme.secondary : theme.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: bg,
        borderWidth: 1.5,
        borderColor: border,
        borderRadius: Radius.md,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        opacity: pressed ? 0.8 : 1,
        ...Shadow.sm,
      })}
    >
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: textColor }}>
          {captured ? capturedLabel : defaultLabel}
        </Text>
        {captured && (
          <Text style={{ fontSize: FontSize.xs, color: theme.secondary, marginTop: 2 }}>
            Tap to recapture
          </Text>
        )}
      </View>
      {captured && (
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: Radius.full,
            backgroundColor: theme.secondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: FontWeight.bold }}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function IncidentCreateScreen() {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<IncidentCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const subcategories = useMemo(() => flattenSubcategories(categories), [categories]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await apiAuthRequest<IncidentCategory[]>('/incident-categories');
        setCategories(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load categories';
        setError(message);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleLocate = async () => {
    setError('');
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) { setError('Location permission denied'); return; }
    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setCoords({ latitude: current.coords.latitude, longitude: current.coords.longitude });
  };

  const handleCapturePhoto = async () => {
    setError('');
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) { setError('Camera permission denied'); return; }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.35,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const info = await FileSystem.getInfoAsync(asset.uri);
    const inferredMime = asset.mimeType || 'image/jpeg';

    if (inferredMime !== 'image/jpeg' && inferredMime !== 'image/webp') {
      setError('Only image/jpeg and image/webp are accepted by backend');
      return;
    }

    const size = info.exists && 'size' in info && typeof info.size === 'number' ? info.size : undefined;
    if (!size) { setError('Unable to determine image size for attachment metadata'); return; }
    if (size > 400 * 1024) { setError('Image is too large (>400KB). Please retake with lower detail.'); return; }

    setPhoto({
      uri: asset.uri,
      fileName: asset.fileName || `capture_${Date.now()}.jpg`,
      mimeType: inferredMime,
      width: asset.width,
      height: asset.height,
      sizeBytes: size,
    });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!title.trim() || !description.trim()) { setError('Title and description are required'); return; }
    if (!selectedCategoryId) { setError('Please select a category'); return; }
    if (!coords) { setError('Please capture your current location'); return; }

    setLoading(true);
    try {
      const incident = await apiAuthRequest<CreatedIncident>('/incidents', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category_id: selectedCategoryId,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      });

      if (photo?.sizeBytes) {
        await apiAuthRequest(`/incidents/${incident.id}/attachments`, {
          method: 'POST',
          body: JSON.stringify({
            storage_path: `mobile/local/${incident.id}/${Date.now()}_${photo.fileName}`,
            file_name: photo.fileName,
            mime_type: photo.mimeType,
            size_bytes: photo.sizeBytes,
            width: photo.width,
            height: photo.height,
          }),
        });
      }

      setSuccess('Incident submitted successfully');
      setTitle('');
      setDescription('');
      setSelectedCategoryId('');
      setPhoto(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ padding: Spacing.xl, paddingBottom: Spacing['4xl'] }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <Text
        style={{
          fontSize: FontSize['2xl'],
          fontWeight: FontWeight.extrabold,
          color: theme.text,
          letterSpacing: 0.2,
          marginBottom: Spacing.xs,
        }}
      >
        Report Incident
      </Text>
      <Text
        style={{
          fontSize: FontSize.sm,
          color: theme.textSecondary,
          marginBottom: Spacing['2xl'],
          lineHeight: 20,
        }}
      >
        Provide details, select a category, and attach your GPS location.
      </Text>

      {/* ── Details section ── */}
      <AppInput label="Title" value={title} onChangeText={setTitle} placeholder="Brief incident title" />
      <AppInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Describe what happened…"
      />

      {/* ── Category section ── */}
      <SectionLabel>Subcategory</SectionLabel>
      {loadingCategories ? (
        <ActivityIndicator
          color={theme.primary}
          style={{ marginVertical: Spacing.lg, alignSelf: 'flex-start' }}
        />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing['2xl'] }}>
          {subcategories.map((item) => {
            const selected = selectedCategoryId === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedCategoryId(item.id)}
                style={({ pressed }) => ({
                  borderWidth: 1.5,
                  borderColor: selected ? theme.primary : theme.border,
                  backgroundColor: selected ? theme.primaryBg : theme.surface,
                  borderRadius: Radius.full,
                  paddingVertical: Spacing.sm,
                  paddingHorizontal: Spacing.md,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    color: selected ? theme.primary : theme.textSecondary,
                    fontSize: FontSize.sm,
                    fontWeight: selected ? FontWeight.semibold : FontWeight.normal,
                  }}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Location & photo section ── */}
      <SectionLabel>Location & Media</SectionLabel>
      <View style={{ gap: Spacing.md, marginBottom: Spacing['2xl'] }}>
        <CaptureButton
          onPress={handleLocate}
          captured={!!coords}
          defaultLabel="Capture GPS Location"
          capturedLabel={
            coords
              ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
              : 'Location Captured'
          }
          icon="📍"
        />
        <CaptureButton
          onPress={handleCapturePhoto}
          captured={!!photo}
          defaultLabel="Take Photo"
          capturedLabel={photo ? photo.fileName : 'Photo Captured'}
          icon="📷"
        />
        {photo && (
          <Text
            style={{
              fontSize: FontSize.xs,
              color: theme.textMuted,
              marginTop: -Spacing.sm,
              paddingHorizontal: Spacing.xs,
            }}
          >
            {photo.sizeBytes ? `${(photo.sizeBytes / 1024).toFixed(1)} KB` : ''}
            {photo.width && photo.height ? `  ·  ${photo.width}×${photo.height}` : ''}
          </Text>
        )}
      </View>

      {/* ── Status banners ── */}
      {error ? <StatusBanner message={error} variant="error" /> : null}
      {success ? <StatusBanner message={success} variant="success" /> : null}

      {/* ── Submit ── */}
      <AppButton
        label="Submit Incident"
        onPress={handleSubmit}
        loading={loading}
        variant="primary"
      />
    </ScrollView>
  );
}
