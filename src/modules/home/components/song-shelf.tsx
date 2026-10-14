import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { Artwork } from '@/common/components/artwork';
import type { Track } from '@/common/store/types';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';

const ROWS = 4;

/** Songs in columns of four that page sideways, like YouTube Music's Quick picks. */
export function SongShelf({ songs, activeId, onPlay }: { songs: Track[]; activeId?: string; onPlay: (index: number) => void }) {
  const styles = useStyles();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  // Most of the screen, so the next column peeks in and says "there is more".
  const columnWidth = Math.min(width * 0.84, 420);
  const columns = Array.from({ length: Math.ceil(songs.length / ROWS) }, (_, c) => songs.slice(c * ROWS, c * ROWS + ROWS));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={columnWidth + space.md}
      decelerationRate="fast"
      style={styles.bleed}
      contentContainerStyle={styles.columns}>
      {columns.map((column, c) => (
        <View key={c} style={{ width: columnWidth }}>
          {column.map((track, r) => {
            const index = c * ROWS + r;
            const active = track.id === activeId;
            return (
              <Pressable key={track.id} onPress={() => onPlay(index)} accessibilityLabel={`${track.title} by ${track.artist}`} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                <Artwork uri={track.artwork} label={track.title} size={48} rounded={theme.radius.sm} />
                <View style={styles.text}>
                  <Text style={[styles.title, active && styles.active]} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const useStyles = makeStyles((t) => ({
  bleed: { marginHorizontal: -space.lg },
  columns: { gap: space.md, paddingHorizontal: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 60, paddingVertical: space.xs },
  pressed: { opacity: 0.6 },
  text: { flex: 1, minWidth: 0 },
  title: { ...t.text.strong, fontSize: 15, color: t.color.text },
  active: { color: t.color.accentSoft },
  artist: { ...t.text.body, fontSize: 13, color: t.color.textMuted, marginTop: 2 },
}));
