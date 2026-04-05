import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';

type ThemeName = keyof typeof Colors;
type ColorName = keyof (typeof Colors)['light'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
) {
  const theme = (useColorScheme() ?? 'light') as ThemeName;
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[theme][colorName];
}
