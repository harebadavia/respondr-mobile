import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiAuthRequest } from '../services/api';
import type { IncidentSummary, LocationItem } from '../types';
import { useTheme } from '../../hooks/use-theme-color';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { StatusBanner } from '../../components/StatusBanner';

const STATUS_OPTIONS = ['all', 'pending', 'verified', 'in_progress', 'resolved', 'rejected'] as const;

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

export default function MapScreenWeb() {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>('all');
  const [showIncidents, setShowIncidents] = useState(true);
  const [showLocations, setShowLocations] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setRefreshing(true);
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
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setIncidents([]);
      setLocations([]);
      return;
    }
    loadData();
  }, [isAuthenticated, loadData]);

  const incidentPoints = useMemo(
    () =>
      incidents.filter((item) => {
        const latitude = toNumber(item.latitude);
        const longitude = toNumber(item.longitude);
        return latitude !== null && longitude !== null;
      }),
    [incidents]
  );

  const filteredIncidents = useMemo(() => {
    if (statusFilter === 'all') return incidentPoints;
    return incidentPoints.filter((incident) => incident.status === statusFilter);
  }, [incidentPoints, statusFilter]);

  const locationPoints = useMemo(
    () =>
      locations.filter((item) => {
        const latitude = toNumber(item.latitude);
        const longitude = toNumber(item.longitude);
        return latitude !== null && longitude !== null;
      }),
    [locations]
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, gap: Spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.extrabold, color: theme.text, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            Resident Map
          </Text>
          <Pressable
            onPress={loadData}
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

      <View style={{ marginHorizontal: Spacing.xl, marginTop: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, padding: Spacing.lg, gap: Spacing.sm }}>
        <Text style={{ fontSize: FontSize.lg }}>🗺️</Text>
        <Text style={{ color: theme.text, fontSize: FontSize.md, fontWeight: FontWeight.bold }}>
          Map view is available on iOS/Android
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm }}>
          Web shows fallback content. Use the locations list below to review map points.
        </Text>
        <Text style={{ color: theme.textMuted, fontSize: FontSize.xs }}>
          Incident points: {showIncidents ? filteredIncidents.length : 0} · Locations: {showLocations ? locationPoints.length : 0}
        </Text>
      </View>

      <View style={{ flex: 1, marginTop: Spacing.md, marginHorizontal: Spacing.xl, marginBottom: Spacing.lg }}>
        <View
          style={{
            borderRadius: Radius.xl,
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
            ...Shadow.md,
            flex: 1,
          }}
        >
          <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.border }}>
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
              data={showLocations ? locationPoints : []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const selected = selectedLocationId === item.id;
                return (
                  <Pressable
                    onPress={() => setSelectedLocationId(item.id)}
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
  );
}
