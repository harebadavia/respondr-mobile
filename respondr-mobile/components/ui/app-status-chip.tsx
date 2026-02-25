import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Status = 'pending' | 'verified' | 'in_progress' | 'resolved' | 'rejected';

export function AppStatusChip({ status }: { status: Status | string }) {
  const theme = useColorScheme() ?? 'light';
  const palette = Colors[theme];

  const bgMap = {
    pending: `${palette.pending}22`,
    verified: `${palette.verified}22`,
    in_progress: `${palette.in_progress}22`,
    resolved: `${palette.resolved}22`,
    rejected: `${palette.rejected}22`,
  } as const;

  const textMap = {
    pending: palette.pending,
    verified: palette.verified,
    in_progress: palette.in_progress,
    resolved: palette.resolved,
    rejected: palette.rejected,
  } as const;

  const normalized = (status in bgMap ? status : 'pending') as keyof typeof bgMap;

  return (
    <View style={[styles.chip, { backgroundColor: bgMap[normalized] }]}>
      <Text style={[styles.text, { color: textMap[normalized] }]}>{String(status).replace('_', ' ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
