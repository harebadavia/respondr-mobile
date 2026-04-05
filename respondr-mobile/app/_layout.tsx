import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { AuthProvider } from '../src/context/AuthContext';
import { Colors, FontWeight, Radius, Shadow, Spacing } from '../constants/theme';

// ── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { name: 'home', label: 'Reports', icon: 'document-text-outline', activeIcon: 'document-text' },
  { name: 'alerts', label: 'Alerts', icon: 'notifications-outline', activeIcon: 'notifications' },
  { name: 'announcements', label: 'Announcements', icon: 'megaphone-outline', activeIcon: 'megaphone' },
] as const;

// ── Custom pill tab bar ──────────────────────────────────────────────────────
function PillTabBar({ state, navigation }: { state: any; navigation: any }) {
  const theme = Colors.light;
  const activeRouteName = state.routes?.[state.index]?.name as string | undefined;
  const [barWidth, setBarWidth] = useState(0);
  const highlightX = useRef(new Animated.Value(0)).current;

  const activeTabIndex = useMemo(() => {
    const idx = TABS.findIndex((tab) => tab.name === activeRouteName);
    return idx >= 0 ? idx : 0;
  }, [activeRouteName]);

  const tabWidth = barWidth > 0 ? (barWidth - Spacing.sm * 2) / TABS.length : 0;

  useEffect(() => {
    if (!tabWidth) return;
    Animated.timing(highlightX, {
      toValue: activeTabIndex * tabWidth,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeTabIndex, highlightX, tabWidth]);

  if (activeRouteName && ['index', 'login', 'register', 'incident-create', 'incident-detail', 'profile', 'map'].includes(activeRouteName)) {
    return null;
  }

  return (
    <View
      onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      style={{
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 28 : 16,
        left: Spacing.xl,
        right: Spacing.xl,
        backgroundColor: theme.headerBg,
        borderRadius: Radius.full,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        ...Shadow.lg,
      }}
    >
      {tabWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: Spacing.sm,
            top: Spacing.sm,
            height: 40,
            width: tabWidth,
            borderRadius: Radius.full,
            backgroundColor: 'rgba(255,255,255,0.16)',
            transform: [{ translateX: highlightX }],
          }}
        />
      ) : null}

      {TABS.map((tab) => {
        const route = state.routes.find((r: any) => r.name === tab.name);
        const isFocused = route && state.index === state.routes.indexOf(route);

        const onPress = () => {
          if (!route) return;
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={tab.name}
            onPress={onPress}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: Spacing.xs,
              borderRadius: Radius.full,
              height: 40,
              paddingHorizontal: Spacing.md,
              backgroundColor: 'transparent',
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Ionicons
              name={(isFocused ? tab.activeIcon : tab.icon) as any}
              size={18}
              color="#ffffff"
            />
            {isFocused && (
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.2,
                }}
              >
                {tab.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Root layout ──────────────────────────────────────────────────────────────
export default function RootLayout() {
  const router = useRouter();
  const theme = Colors.light;

  return (
    <AuthProvider>
      <Tabs
        tabBar={(props) => <PillTabBar {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: theme.headerBg },
          headerTitleStyle: { color: theme.headerText, fontWeight: FontWeight.bold },
          headerTintColor: theme.headerTint,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        {/* ── Hidden auth screens ── */}
        <Tabs.Screen name="index"    options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="login"    options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="register" options={{ href: null, headerShown: false }} />

        {/* ── Main tabs ── */}
        <Tabs.Screen name="home"   options={{ headerShown: false, title: 'Reports' }} />
        <Tabs.Screen name="alerts" options={{ title: 'Alerts' }} />
        <Tabs.Screen name="announcements" options={{ title: 'Announcements' }} />
        <Tabs.Screen name="map"    options={{ href: null, title: 'Map' }} />

        {/* ── Hidden modal ── */}
        <Tabs.Screen
          name="incident-create"
          options={{
            href: null,
            title: 'Report Incident',
            headerLeft: () => (
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => ({
                  paddingHorizontal: Spacing.md,
                  paddingVertical: Spacing.xs,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Ionicons name="chevron-back" size={22} color={theme.headerTint} />
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="incident-detail"
          options={{
            href: null,
            title: 'Report Details',
            headerLeft: () => (
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => ({
                  paddingHorizontal: Spacing.md,
                  paddingVertical: Spacing.xs,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Ionicons name="chevron-back" size={22} color={theme.headerTint} />
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
            title: 'Profile',
            headerLeft: () => (
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => ({
                  paddingHorizontal: Spacing.md,
                  paddingVertical: Spacing.xs,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Ionicons name="chevron-back" size={22} color={theme.headerTint} />
              </Pressable>
            ),
          }}
        />
      </Tabs>
    </AuthProvider>
  );
}
