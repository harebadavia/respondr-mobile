import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0f172a',
    background: '#ffffff',
    tint: '#0f7eb8',
    icon: '#64748b',
    tabIconDefault: '#64748b',
    tabIconSelected: '#0f7eb8',
    card: '#ffffff',
    border: '#e2e8f0',
    muted: '#475569',
    success: '#15803d',
    warning: '#b45309',
    danger: '#b91c1c',
    pending: '#a16207',
    verified: '#0369a1',
    in_progress: '#7c3aed',
    resolved: '#15803d',
    rejected: '#b91c1c',
  },
  dark: {
    text: '#f8fafc',
    background: '#0b1220',
    tint: '#7ad2ff',
    icon: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: '#7ad2ff',
    card: '#111827',
    border: '#334155',
    muted: '#cbd5e1',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    pending: '#f59e0b',
    verified: '#38bdf8',
    in_progress: '#a78bfa',
    resolved: '#22c55e',
    rejected: '#ef4444',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter',
    heading: 'Montserrat',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    heading: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    heading: "Montserrat, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const;

export const Spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
} as const;
