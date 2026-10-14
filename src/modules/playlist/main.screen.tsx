import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Artwork } from '@/common/components/artwork';
import { BackButton } from '@/common/components/back-button';
import { Icon } from '@/common/components/icon';
import { songCount } from '@/common/components/playlist-card';
import { Screen } from '@/common/components/screen';
import { SourceBadge } from '@/common/components/source-badge';
import { Muted, Title } from '@/common/components/text';
import { useLibrary, useNowPlaying, useStore } from '@/common/store/store';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';
import { duration } from '@/utils/format';

export default function PlaylistScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const playlist = useLibrary().find((p) => p.id === id);
  const { dispatch } = useStore();
  const current = useNowPlaying();

  if (!playlist) {
    return (
      <View style={styles.fill}>
        <Screen withTabBar={false} contentContainerStyle={styles.missing}>
          <Title>Playlist not found</Title>
          <Muted>It may have been removed from its service, or the demo library is turned off.</Muted>
        </Screen>
        <BackButton />
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
          <Artwork uri={playlist.artwork} label={playlist.name} size={208} rounded={theme.radius.lg} />
          <View style={styles.heroText}>
            <SourceBadge source={playlist.source} />
            <Title>{playlist.name}</Title>
            <Muted>{playlist.owner} · {songCount(playlist)}</Muted>
          </View>
          {playlist.tracks.length > 0 && (
            <Pressable onPress={() => play(0)} accessibilityLabel={`Play ${playlist.name}`} style={styles.playButton}>
              <Icon name="play" size={26} tint={theme.color.accentInk} filled />
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
      <BackButton />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  fill: { flex: 1, backgroundColor: t.color.bg },
  missing: { paddingTop: 120, gap: space.sm },
  hero: { alignItems: 'center', gap: space.lg, paddingTop: space.xxl },
  heroText: { alignItems: 'center', gap: space.sm },
  playButton: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: t.color.accent },
  track: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 60, paddingVertical: space.sm },
  pressed: { opacity: 0.6 },
  index: { ...t.text.body, width: 22, textAlign: 'center', fontSize: 14, color: t.color.textMuted, fontVariant: ['tabular-nums'] },
  trackText: { flex: 1, minWidth: 0 },
  trackTitle: { ...t.text.strong, fontSize: 15, color: t.color.text },
  trackArtist: { ...t.text.body, fontSize: 13, color: t.color.textMuted, marginTop: 2 },
  trackTime: { ...t.text.body, fontSize: 13, color: t.color.textMuted, fontVariant: ['tabular-nums'] },
  activeText: { color: t.color.accentSoft },
  emptyTracks: { paddingVertical: space.xl, textAlign: 'center' },
}));
