import { Colors } from '../constants/theme';

type ThemeName = keyof typeof Colors;
type ColorName = keyof (typeof Colors)['light'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
) {
  const theme = 'light' as ThemeName;
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[theme][colorName];
}

/** Convenience: returns the full color object for the active theme. */
export function useTheme() {
  return Colors.light;
}
