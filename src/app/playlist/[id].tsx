import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Artwork } from '@/components/artwork';
import { Icon } from '@/components/icon';
import { songCount } from '@/components/playlist-card';
import { Screen } from '@/components/screen';
import { SourceBadge } from '@/components/source-badge';
import { Muted, Title } from '@/components/text';
import { useLibrary, useNowPlaying, useStore } from '@/state/store';
import { color, radius, space } from '@/theme/tokens';

function duration(ms?: number) {
  if (!ms) return '';
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const playlist = useLibrary().find((p) => p.id === id);
  const { dispatch } = useStore();
  const current = useNowPlaying();
  const insets = useSafeAreaInsets();

  const back = (
    <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityLabel="Back" hitSlop={8} style={[styles.back, { top: insets.top + space.sm }]}>
      <Icon name="back" />
    </Pressable>
  );

  if (!playlist) {
    return (
      <View style={styles.fill}>
        <Screen withTabBar={false} contentContainerStyle={styles.missing}>
          <Title>Playlist not found</Title>
          <Muted>It may have been removed from its service, or the demo library is turned off.</Muted>
        </Screen>
        {back}
      </View>
    );
  }

  const play = (index: number) => {
    dispatch({ type: 'play', queue: playlist.tracks, index, contextName: playlist.name });
    router.push('/player');
  };

  return (
    <View style={styles.fill}>
      <Screen withTabBar={false}>
        <View style={styles.hero}>
          <Artwork uri={playlist.artwork} label={playlist.name} size={208} rounded={radius.lg} />
          <View style={styles.heroText}>
            <SourceBadge source={playlist.source} />
            <Title>{playlist.name}</Title>
            <Muted>{playlist.owner} · {songCount(playlist)}</Muted>
          </View>
          {playlist.tracks.length > 0 && (
            <Pressable onPress={() => play(0)} accessibilityLabel={`Play ${playlist.name}`} style={styles.playButton}>
              <Icon name="play" size={26} tint={color.accentInk} filled />
            </Pressable>
          )}
        </View>

        <View>
          {playlist.tracks.map((track, i) => {
            const active = current?.id === track.id;
            return (
              <Pressable key={track.id} onPress={() => play(i)} accessibilityLabel={`${track.title} by ${track.artist}`} style={({ pressed }) => [styles.track, pressed && styles.pressed]}>
                <Text style={[styles.index, active && styles.activeText]}>{active ? '♪' : i + 1}</Text>
                <View style={styles.trackText}>
                  <Text style={[styles.trackTitle, active && styles.activeText]} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                </View>
                <Text style={styles.trackTime}>{duration(track.durationMs)}</Text>
              </Pressable>
            );
          })}
          {playlist.tracks.length === 0 && <Muted style={styles.emptyTracks}>This playlist has no songs yet.</Muted>}
        </View>
      </Screen>
      {back}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: color.bg },
  back: { position: 'absolute', left: space.md, width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(11,12,22,0.7)' },
  missing: { paddingTop: 120, gap: space.sm },
  hero: { alignItems: 'center', gap: space.lg, paddingTop: space.xxl },
  heroText: { alignItems: 'center', gap: space.sm },
  playButton: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: color.accent },
  track: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 60, paddingVertical: space.sm },
  pressed: { opacity: 0.6 },
  index: { width: 22, textAlign: 'center', fontSize: 14, color: color.textMuted, fontVariant: ['tabular-nums'] },
  trackText: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: 15, fontWeight: '600', color: color.text },
  trackArtist: { fontSize: 13, color: color.textMuted, marginTop: 2 },
  trackTime: { fontSize: 13, color: color.textMuted, fontVariant: ['tabular-nums'] },
  activeText: { color: color.accentSoft },
  emptyTracks: { paddingVertical: space.xl, textAlign: 'center' },
});
