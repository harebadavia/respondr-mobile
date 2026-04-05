/**
 * RESPONDR Design System
 * Emergency-response aesthetic: dark navy base, signal-red primary,
 * teal secondary, amber warning. Systematic spacing & type scale.
 */

import { Platform } from 'react-native';

// ─── Palette ────────────────────────────────────────────────────────────────
export const Palette = {
  // Brand primaries
  red500:    '#e63946',
  red600:    '#c1121f',
  red100:    '#fde8ea',

  // Teal (safe / confirm actions)
  teal500:   '#0f9d8a',
  teal600:   '#0b7a6a',
  teal100:   '#d0f4ee',

  // Navy (primary surfaces)
  navy900:   '#0d1b2a',
  navy800:   '#112233',
  navy700:   '#1a3045',
  navy600:   '#1e3a52',

  // Slate (secondary surfaces / borders)
  slate800:  '#1e293b',
  slate700:  '#2d3f55',
  slate400:  '#64748b',
  slate300:  '#94a3b8',
  slate200:  '#cbd5e1',
  slate100:  '#f1f5f9',

  // Amber (warning)
  amber500:  '#f59e0b',
  amber100:  '#fef3c7',

  // Blue (info)
  blue500:   '#3b82f6',
  blue100:   '#dbeafe',

  // Utility
  white:     '#ffffff',
  black:     '#000000',
  transparent: 'transparent',

  // Status
  success:   '#16a34a',
  successBg: '#dcfce7',
  error:     '#e63946',
  errorBg:   '#fde8ea',
  warning:   '#f59e0b',
  warningBg: '#fef3c7',
  info:      '#3b82f6',
  infoBg:    '#dbeafe',
};

// ─── Semantic tokens (light scheme) ─────────────────────────────────────────
export const Colors = {
  light: {
    // Surfaces
    background:        Palette.slate100,
    surface:           Palette.white,
    surfaceElevated:   Palette.white,
    surfaceMuted:      '#f8fafc',

    // Text
    text:              Palette.navy900,
    textSecondary:     Palette.slate400,
    textMuted:         Palette.slate300,
    textInverse:       Palette.white,

    // Brand actions
    primary:           Palette.red500,
    primaryDark:       Palette.red600,
    primaryBg:         Palette.red100,

    secondary:         Palette.teal500,
    secondaryDark:     Palette.teal600,
    secondaryBg:       Palette.teal100,

    // Borders
    border:            Palette.slate200,
    borderStrong:      Palette.slate300,

    // Navigation header
    headerBg:          Palette.navy900,
    headerText:        Palette.white,
    headerTint:        Palette.white,

    // Icon / tab defaults
    tint:              Palette.red500,
    icon:              Palette.slate400,
    tabIconDefault:    Palette.slate400,
    tabIconSelected:   Palette.red500,

    // Status
    success:           Palette.success,
    successBg:         Palette.successBg,
    error:             Palette.error,
    errorBg:           Palette.errorBg,
    warning:           Palette.warning,
    warningBg:         Palette.warningBg,
    info:              Palette.info,
    infoBg:            Palette.infoBg,
  },
  dark: {
    background:        Palette.navy900,
    surface:           Palette.navy800,
    surfaceElevated:   Palette.navy700,
    surfaceMuted:      Palette.navy800,

    text:              '#e2e8f0',
    textSecondary:     Palette.slate300,
    textMuted:         Palette.slate400,
    textInverse:       Palette.navy900,

    primary:           Palette.red500,
    primaryDark:       Palette.red600,
    primaryBg:         '#3d1015',

    secondary:         Palette.teal500,
    secondaryDark:     Palette.teal600,
    secondaryBg:       '#0a2e28',

    border:            Palette.slate700,
    borderStrong:      Palette.slate400,

    headerBg:          Palette.navy900,
    headerText:        Palette.white,
    headerTint:        Palette.white,

    tint:              Palette.red500,
    icon:              Palette.slate300,
    tabIconDefault:    Palette.slate400,
    tabIconSelected:   Palette.red500,

    success:           '#4ade80',
    successBg:         '#052e16',
    error:             '#f87171',
    errorBg:           '#3d1015',
    warning:           '#fbbf24',
    warningBg:         '#2d1f04',
    info:              '#60a5fa',
    infoBg:            '#0c2143',
  },
};

// ─── Spacing scale ───────────────────────────────────────────────────────────
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

// ─── Border radius ───────────────────────────────────────────────────────────
export const Radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  full: 999,
};

// ─── Type scale ──────────────────────────────────────────────────────────────
export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
};

export const FontWeight = {
  normal:      '400' as const,
  medium:      '500' as const,
  semibold:    '600' as const,
  bold:        '700' as const,
  extrabold:   '800' as const,
};

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ─── Fonts (platform-aware) ──────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
