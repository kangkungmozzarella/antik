import { Pressable, Text, View } from 'react-native';

import { Artwork } from '@/common/components/artwork';
import type { Track } from '@/common/store/types';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';
import { duration } from '@/utils/format';

export function SongRow({ track, active, onPress }: { track: Track; active: boolean; onPress: () => void }) {
  const styles = useStyles();
  const theme = useTheme();
  const meta = [track.artist, track.album].filter(Boolean).join(' · ');
  return (
    <Pressable onPress={onPress} accessibilityLabel={`${track.title} by ${track.artist}`} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Artwork uri={track.artwork} label={track.title} size={52} rounded={theme.radius.sm} />
      <View style={styles.text}>
        <Text style={[styles.title, active && styles.active]} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.meta} numberOfLines={1}>{meta}</Text>
      </View>
      <Text style={styles.time}>{duration(track.durationMs)}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 64, paddingVertical: space.xs },
  pressed: { opacity: 0.6 },
  text: { flex: 1, minWidth: 0 },
  title: { ...t.text.strong, fontSize: 15, color: t.color.text },
  active: { color: t.color.accentSoft },
  meta: { ...t.text.body, fontSize: 13, color: t.color.textMuted, marginTop: 2 },
  time: { ...t.text.body, fontSize: 13, color: t.color.textMuted, fontVariant: ['tabular-nums'] },
}));
