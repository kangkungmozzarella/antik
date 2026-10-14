import { Pressable, Text, View } from 'react-native';

import { Artwork } from '@/common/components/artwork';
import type { Track } from '@/common/store/types';
import { makeStyles } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';

/** Spotify-style quick grid: two columns of what was played last. */
export function RecentGrid({ tracks, onPlay }: { tracks: Track[]; onPlay: (index: number) => void }) {
  const styles = useStyles();
  return (
    <View style={styles.grid}>
      {tracks.map((track, i) => (
        <Pressable
          key={track.id}
          onPress={() => onPlay(i)}
          accessibilityLabel={`${track.title} by ${track.artist}`}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
          <Artwork uri={track.artwork} label={track.title} size={52} rounded={0} />
          <Text style={styles.title} numberOfLines={2}>{track.title}</Text>
        </Pressable>
      ))}
      {/* Keeps the last tile half-width when the count is odd. */}
      {tracks.length % 2 === 1 && <View style={[styles.tile, styles.spacer]} accessible={false} />}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tile: { flexBasis: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 52, paddingRight: space.sm, borderRadius: t.radius.sm, overflow: 'hidden', backgroundColor: t.color.surfaceStrong },
  spacer: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.7 },
  title: { ...t.text.strong, flex: 1, fontSize: 13, lineHeight: 17, color: t.color.text },
}));
