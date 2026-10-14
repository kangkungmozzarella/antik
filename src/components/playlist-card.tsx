import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Playlist } from '@/state/types';
import { color, radius, space } from '@/theme/tokens';

import { Artwork } from './artwork';
import { SourceBadge } from './source-badge';

export function songCount(playlist: Playlist) {
  return `${playlist.tracks.length} ${playlist.tracks.length === 1 ? 'song' : 'songs'}`;
}

const openPlaylist = (id: string) => router.push({ pathname: '/playlist/[id]', params: { id } });

/** Tall card for horizontal shelves on Home. */
export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Pressable onPress={() => openPlaylist(playlist.id)} accessibilityRole="link" accessibilityLabel={`${playlist.name}, ${songCount(playlist)}`} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Artwork uri={playlist.artwork} label={playlist.name} size={148} />
      <Text style={styles.name} numberOfLines={1}>{playlist.name}</Text>
      <SourceBadge source={playlist.source} />
    </Pressable>
  );
}

/** Full-width row for the Library list. */
export function PlaylistRow({ playlist }: { playlist: Playlist }) {
  return (
    <Pressable onPress={() => openPlaylist(playlist.id)} accessibilityRole="link" accessibilityLabel={`${playlist.name}, ${songCount(playlist)}`} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Artwork uri={playlist.artwork} label={playlist.name} size={56} rounded={radius.sm} />
      <View style={styles.rowText}>
        <Text style={styles.rowName} numberOfLines={1}>{playlist.name}</Text>
        <Text style={styles.rowMeta} numberOfLines={1}>{playlist.owner} · {songCount(playlist)}</Text>
      </View>
      <SourceBadge source={playlist.source} style={styles.rowBadge} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 148, gap: space.sm },
  pressed: { opacity: 0.7 },
  name: { fontSize: 15, fontWeight: '600', color: color.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm, minHeight: 64 },
  rowText: { flex: 1, minWidth: 0 },
  rowName: { fontSize: 15, fontWeight: '600', color: color.text },
  rowBadge: { alignSelf: 'center' },
  rowMeta: { fontSize: 13, color: color.textMuted, marginTop: 2 },
});
