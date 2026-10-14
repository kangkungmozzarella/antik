import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { sourceLabel, type Source } from '@/state/types';
import { color, radius, sourceColor } from '@/theme/tokens';

// The one functional label in AnTik: where this music lives. Dot colour = the service.
export function SourceBadge({ source, style }: { source: Source; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.badge, style]}>
      <View style={[styles.dot, { backgroundColor: sourceColor[source] }]} />
      <Text style={styles.label}>{sourceLabel[source]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.sm, backgroundColor: color.surface },
  dot: { width: 7, height: 7, borderRadius: 4 },
  label: { fontSize: 11, fontWeight: '600', color: color.textSoft, letterSpacing: 0.2 },
});
