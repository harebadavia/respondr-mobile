import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontSizes, Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const tint = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');

  return (
    <Text
      style={[
        { color, fontFamily: Fonts?.sans },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? [styles.link, { color: tint }] : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: FontSizes.base,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: FontSizes.base,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: '700',
    lineHeight: 36,
    fontFamily: Fonts?.heading,
  },
  subtitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    fontFamily: Fonts?.heading,
  },
  link: {
    lineHeight: 24,
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
});
