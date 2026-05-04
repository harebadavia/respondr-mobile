import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MapView, { Callout, Marker, type Region } from 'react-native-maps';
import { useAuth } from '../context/AuthContext';
import { apiAuthRequest } from '../services/api';
import type { IncidentSummary, LocationItem } from '../types';
import { useTheme } from '../../hooks/use-theme-color';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { StatusBanner } from '../../components/StatusBanner';

const DEFAULT_REGION: Region = {
  latitude: 14.425819,
  longitude: 120.886698,
  latitudeDelta: 0.07,
  longitudeDelta: 0.07,
};

const STATUS_OPTIONS = ['all', 'pending', 'verified', 'in_progress', 'resolved', 'rejected'] as const;

const INCIDENT_STATUS_COLORS: Record<string, string> = {
  pending: '#d97706',
  verified: '#0284c7',
  in_progress: '#7c3aed',
  resolved: '#059669',
  rejected: '#dc2626',
};

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getErrorMessage(err: unknown) {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return 'Failed to load map data';
}

function formatStatus(status: string) {
  return String(status || 'pending').replace(/_/g, ' ');
}

function categoryText(incident: IncidentSummary) {
  const parent = incident.parent_category_name || 'Uncategorized';
  return incident.category_name ? `${parent} > ${incident.category_name}` : parent;
}

export default function MapScreen() {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const mapRef = useRef<MapView | null>(null);
  const locationMarkerRefs = useRef<Record<string, Marker | null>>({});

  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>('all');
  const [showIncidents, setShowIncidents] = useState(true);
  const [showLocations, setShowLocations] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const loadData = useCallback(async (mode: 'initial' | 'refresh' = 'refresh') => {
    if (mode === 'initial') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    setError('');

    try {
      const [incidentsData, locationsData] = await Promise.all([
        apiAuthRequest<IncidentSummary[]>('/incidents/my'),
        apiAuthRequest<LocationItem[]>('/locations'),
      ]);

      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      if (mode === 'initial') setLoading(false);
      if (mode === 'refresh') setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setIncidents([]);
      setLocations([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    loadData('initial');
  }, [isAuthenticated, loadData]);

  const incidentPoints = useMemo(
    () =>
      incidents
        .map((item) => {
          const latitude = toNumber(item.latitude);
          const longitude = toNumber(item.longitude);
          return latitude === null || longitude === null ? null : { ...item, latitude, longitude };
        })
        .filter(Boolean) as Array<IncidentSummary & { latitude: number; longitude: number }>,
    [incidents]
  );

  const locationPoints = useMemo(
    () =>
      locations
        .map((item) => {
          const latitude = toNumber(item.latitude);
          const longitude = toNumber(item.longitude);
          return latitude === null || longitude === null ? null : { ...item, latitude, longitude };
        })
        .filter(Boolean) as Array<LocationItem & { latitude: number; longitude: number }>,
    [locations]
  );

  const filteredIncidents = useMemo(() => {
    if (statusFilter === 'all') return incidentPoints;
    return incidentPoints.filter((incident) => incident.status === statusFilter);
  }, [incidentPoints, statusFilter]);

  const mapRegion = useMemo(() => {
    const firstLocation = locationPoints[0];
    if (firstLocation) {
      return {
        latitude: firstLocation.latitude,
        longitude: firstLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    const firstIncident = filteredIncidents[0];
    if (firstIncident) {
      return {
        latitude: firstIncident.latitude,
        longitude: firstIncident.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    return DEFAULT_REGION;
  }, [filteredIncidents, locationPoints]);

  const focusLocation = (location: LocationItem & { latitude: number; longitude: number }) => {
    setSelectedLocationId(location.id);
    setShowLocations(true);

    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      450
    );

    setTimeout(() => {
      locationMarkerRefs.current[location.id]?.showCallout();
    }, 500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, gap: Spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.extrabold, color: theme.text, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            Resident Map
          </Text>
          <Pressable
            onPress={() => loadData('refresh')}
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

        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <Pressable
            onPress={() => setShowIncidents((prev) => !prev)}
            style={({ pressed }) => ({
              borderRadius: Radius.full,
              paddingVertical: Spacing.sm,
              paddingHorizontal: Spacing.md,
              borderWidth: 1,
              borderColor: showIncidents ? theme.primary : theme.border,
              backgroundColor: showIncidents ? theme.primaryBg : theme.surface,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: showIncidents ? theme.primary : theme.textSecondary, fontSize: FontSize.xs, fontWeight: FontWeight.bold }}>
              {showIncidents ? 'Incidents: ON' : 'Incidents: OFF'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setShowLocations((prev) => !prev)}
            style={({ pressed }) => ({
              borderRadius: Radius.full,
              paddingVertical: Spacing.sm,
              paddingHorizontal: Spacing.md,
              borderWidth: 1,
              borderColor: showLocations ? theme.secondary : theme.border,
              backgroundColor: showLocations ? theme.secondaryBg : theme.surface,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: showLocations ? theme.secondary : theme.textSecondary, fontSize: FontSize.xs, fontWeight: FontWeight.bold }}>
              {showLocations ? 'Locations: ON' : 'Locations: OFF'}
            </Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
          {STATUS_OPTIONS.map((status) => {
            const selected = statusFilter === status;
            const label = status === 'all' ? 'All statuses' : formatStatus(status);
            return (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(status)}
                style={({ pressed }) => ({
                  borderRadius: Radius.full,
                  paddingVertical: Spacing.sm,
                  paddingHorizontal: Spacing.md,
                  borderWidth: 1,
                  borderColor: selected ? theme.primary : theme.border,
                  backgroundColor: selected ? theme.primaryBg : theme.surface,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ fontSize: FontSize.xs, color: selected ? theme.primary : theme.textSecondary, fontWeight: FontWeight.semibold, textTransform: 'capitalize' }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {error ? <StatusBanner message={error} variant="error" /> : null}
      </View>

      <View style={{ flex: 1, marginTop: Spacing.md }}>
        <MapView
          ref={mapRef}
          initialRegion={mapRegion}
          style={{ flex: 1 }}
          showsUserLocation={false}
          showsCompass
          loadingEnabled
        >
          {showIncidents &&
            filteredIncidents.map((incident) => {
              const color = INCIDENT_STATUS_COLORS[incident.status] || '#374151';
              return (
                <Marker
                  key={`incident-${incident.id}`}
                  coordinate={{ latitude: incident.latitude, longitude: incident.longitude }}
                  pinColor={color}
                >
                  <Callout>
                    <View style={{ width: 220, gap: 2 }}>
                      <Text style={{ fontWeight: FontWeight.bold, color: '#111827' }}>{incident.title}</Text>
                      <Text style={{ fontSize: 12, color: '#374151', textTransform: 'capitalize' }}>
                        Status: {formatStatus(incident.status)}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#374151' }}>Category: {categoryText(incident)}</Text>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        Created: {new Date(incident.created_at).toLocaleString()}
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}

          {showLocations &&
            locationPoints.map((location) => (
              <Marker
                key={`location-${location.id}`}
                ref={(ref) => {
                  locationMarkerRefs.current[location.id] = ref;
                }}
                coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                pinColor="#0f766e"
              >
                <Callout>
                  <View style={{ width: 220, gap: 2 }}>
                    <Text style={{ fontWeight: FontWeight.bold, color: '#111827' }}>{location.name}</Text>
                    <Text style={{ fontSize: 12, color: '#374151' }}>
                      {location.description || 'No description'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#374151' }}>
                      {location.latitude}, {location.longitude}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>
                      {location.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            ))}
        </MapView>

        {loading ? (
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.md }}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={{ color: theme.textSecondary, marginTop: Spacing.sm, fontSize: FontSize.sm }}>Loading map data...</Text>
            </View>
          </View>
        ) : null}

        <View
          style={{
            position: 'absolute',
            left: Spacing.md,
            right: Spacing.md,
            bottom: Spacing.md,
          }}
        >
          <View
            style={{
              borderRadius: Radius.xl,
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
              maxHeight: '42%',
              ...Shadow.md,
            }}
          >
            <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.border }}>
              <View
                style={{
                  alignSelf: 'center',
                  width: 42,
                  height: 4,
                  borderRadius: Radius.full,
                  backgroundColor: theme.borderStrong,
                  marginBottom: Spacing.sm,
                }}
              />
              <Text style={{ fontSize: FontSize.sm, color: theme.text, fontWeight: FontWeight.extrabold, letterSpacing: 1, textTransform: 'uppercase' }}>
                Locations ({locationPoints.length})
              </Text>
            </View>

            {locationPoints.length === 0 ? (
              <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg }}>
                <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm }}>
                  No active locations available.
                </Text>
              </View>
            ) : (
              <FlatList
                data={locationPoints}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const selected = selectedLocationId === item.id;
                  return (
                    <Pressable
                      onPress={() => focusLocation(item)}
                      style={({ pressed }) => ({
                        marginHorizontal: Spacing.md,
                        marginTop: Spacing.sm,
                        marginBottom: Spacing.xs,
                        borderRadius: Radius.md,
                        borderWidth: 1,
                        borderColor: selected ? theme.primary : theme.border,
                        backgroundColor: selected ? theme.primaryBg : theme.surface,
                        paddingHorizontal: Spacing.md,
                        paddingVertical: Spacing.sm + 2,
                        opacity: pressed ? 0.85 : 1,
                      })}
                    >
                      <Text style={{ color: theme.text, fontSize: FontSize.sm, fontWeight: FontWeight.bold }} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: FontSize.xs, marginTop: 2 }} numberOfLines={2}>
                        {item.description || 'No description'}
                      </Text>
                    </Pressable>
                  );
                }}
                contentContainerStyle={{ paddingBottom: Spacing.md }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
