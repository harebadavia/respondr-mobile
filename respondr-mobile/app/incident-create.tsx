import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { AppInput } from '../components/AppInput';
import { apiAuthRequest } from '../src/services/api';
import type { IncidentCategory } from '../src/types';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type SelectedPhoto = {
  uri: string;
  fileName: string;
  mimeType: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
};

type CreatedIncident = {
  id: string;
};

function flattenSubcategories(categories: IncidentCategory[]) {
  const out: IncidentCategory[] = [];
  for (const parent of categories) {
    if (Array.isArray(parent.subcategories)) {
      for (const sub of parent.subcategories) {
        out.push(sub);
      }
    }
  }
  return out;
}

export default function IncidentCreateScreen() {
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
    if (!permission.granted) {
      setError('Location permission denied');
      return;
    }

    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setCoords({ latitude: current.coords.latitude, longitude: current.coords.longitude });
  };

  const handleCapturePhoto = async () => {
    setError('');

    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      setError('Camera permission denied');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.35,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const info = await FileSystem.getInfoAsync(asset.uri);
    const inferredMime = asset.mimeType || 'image/jpeg';

    if (inferredMime !== 'image/jpeg' && inferredMime !== 'image/webp') {
      setError('Only image/jpeg and image/webp are accepted by backend');
      return;
    }

    const size = info.exists && 'size' in info && typeof info.size === 'number' ? info.size : undefined;

    if (!size) {
      setError('Unable to determine image size for attachment metadata');
      return;
    }

    if (size > 400 * 1024) {
      setError('Image is too large (>400KB). Please retake with lower detail.');
      return;
    }

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

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    if (!selectedCategoryId) {
      setError('Please select a category');
      return;
    }

    if (!coords) {
      setError('Please capture your current location');
      return;
    }

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
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 10 }}>Report Incident</Text>
      <Text style={{ color: '#4b5563', marginBottom: 18 }}>
        Week 11 core flow: category + GPS + camera metadata attachment.
      </Text>

      <AppInput label="Title" value={title} onChangeText={setTitle} />
      <AppInput label="Description" value={description} onChangeText={setDescription} multiline />

      <Text style={{ fontWeight: '600', marginBottom: 6 }}>Choose Subcategory</Text>
      {loadingCategories ? (
        <ActivityIndicator style={{ marginVertical: 12 }} />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {subcategories.map((item) => {
            const selected = selectedCategoryId === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedCategoryId(item.id)}
                style={{
                  borderWidth: 1,
                  borderColor: selected ? '#0f766e' : '#d1d5db',
                  backgroundColor: selected ? '#ccfbf1' : '#fff',
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ color: selected ? '#115e59' : '#374151' }}>{item.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Pressable
        onPress={handleLocate}
        style={{ backgroundColor: '#1d4ed8', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 10 }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>{coords ? 'Location Captured' : 'Capture Location'}</Text>
      </Pressable>

      {coords ? (
        <Text style={{ color: '#4b5563', marginBottom: 16 }}>
          Lat: {coords.latitude.toFixed(5)} | Lng: {coords.longitude.toFixed(5)}
        </Text>
      ) : null}

      <Pressable
        onPress={handleCapturePhoto}
        style={{ backgroundColor: '#4338ca', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 10 }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>{photo ? 'Photo Captured' : 'Capture Photo'}</Text>
      </Pressable>

      {photo ? (
        <Text style={{ color: '#4b5563', marginBottom: 16 }}>
          {photo.fileName} ({photo.sizeBytes} bytes)
        </Text>
      ) : null}

      {error ? <Text style={{ color: '#dc2626', marginBottom: 10 }}>{error}</Text> : null}
      {success ? <Text style={{ color: '#15803d', marginBottom: 10 }}>{success}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: '#0f766e',
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: 'center',
          opacity: loading ? 0.7 : 1,
          marginBottom: 20,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '700' }}>Submit Incident</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
