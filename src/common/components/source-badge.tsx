import { View, Text, type StyleProp, type ViewStyle } from 'react-native';

import { sourceLabel, type Source } from '@/common/store/types';
import { makeStyles } from '@/common/theme/theme';
import { sourceColor } from '@/common/theme/tokens';

// The one functional label in AnTik: where this music lives. Dot colour = the service.
export function SourceBadge({ source, style }: { source: Source; style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  return (
    <View style={[styles.badge, style]}>
      <View style={[styles.dot, { backgroundColor: sourceColor[source] }]} />
      <Text style={styles.label}>{sourceLabel[source]}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: t.radius.sm, backgroundColor: t.color.surface },
  dot: { width: 7, height: 7, borderRadius: 4 },
  label: { ...t.text.strong, fontSize: 11, color: t.color.textSoft, letterSpacing: 0.2 },
}));
