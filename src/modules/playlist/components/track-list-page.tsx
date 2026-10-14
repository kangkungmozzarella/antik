import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Artwork } from '@/common/components/artwork';
import { BackButton } from '@/common/components/back-button';
import { Icon } from '@/common/components/icon';
import { Screen } from '@/common/components/screen';
import { SourceBadge } from '@/common/components/source-badge';
import { Muted, Title } from '@/common/components/text';
import { useNowPlaying, useStore } from '@/common/store/store';
import type { Source, Track } from '@/common/store/types';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';
import { duration } from '@/utils/format';

export type TrackListPageProps = {
  title: string;
  /** One line under the title, e.g. "Demo library · 5 songs". */
  meta?: string;
  source: Source;
  artwork?: string;
  tracks: Track[];
};

/** Cover, title and a playable track list; shared by library and YouTube Music collections. */
export function TrackListPage({ title, meta, source, artwork, tracks }: TrackListPageProps) {
  const styles = useStyles();
  const theme = useTheme();
  const { dispatch } = useStore();
  const current = useNowPlaying();

  const play = (index: number) => {
    dispatch({ type: 'play', queue: tracks, index, contextName: title });
    router.push('/player');
  };

  return (
    <View style={styles.fill}>
      <Screen withTabBar={false}>
        <View style={styles.hero}>
          <Artwork uri={artwork} label={title} size={208} rounded={theme.radius.lg} />
          <View style={styles.heroText}>
            <SourceBadge source={source} />
            <Title style={styles.center}>{title}</Title>
            {!!meta && <Muted style={styles.center}>{meta}</Muted>}
          </View>
          {tracks.length > 0 && (
            <Pressable onPress={() => play(0)} accessibilityLabel={`Play ${title}`} style={styles.playButton}>
              <Icon name="play" size={26} tint={theme.color.accentInk} filled />
            </Pressable>
          )}
        </View>

        <View>
          {tracks.map((track, i) => {
            const active = current?.id === track.id;
            return (
              <Pressable key={`${track.id}-${i}`} onPress={() => play(i)} accessibilityLabel={`${track.title} by ${track.artist}`} style={({ pressed }) => [styles.track, pressed && styles.pressed]}>
                <Text style={[styles.index, active && styles.activeText]}>{active ? '♪' : i + 1}</Text>
                <View style={styles.trackText}>
                  <Text style={[styles.trackTitle, active && styles.activeText]} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                </View>
                <Text style={styles.trackTime}>{duration(track.durationMs)}</Text>
              </Pressable>
            );
          })}
          {tracks.length === 0 && <Muted style={styles.emptyTracks}>This playlist has no songs yet.</Muted>}
        </View>
      </Screen>
      <BackButton />
    </View>
  );
}

/** Same frame as a list, for loading, errors and missing playlists. */
export function TrackListMessage({ title, body, busy, onRetry }: { title: string; body: string; busy?: boolean; onRetry?: () => void }) {
  const styles = useStyles();
  return (
    <View style={styles.fill}>
      <Screen withTabBar={false} contentContainerStyle={styles.missing}>
        <Title>{title}</Title>
        <Muted>{body}</Muted>
        {busy && <Icon name="vinyl" size={28} />}
        {onRetry && (
          <Pressable onPress={onRetry} accessibilityRole="button" style={styles.retry}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        )}
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
  center: { textAlign: 'center' },
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
  retry: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  retryText: { ...t.text.bold, fontSize: 15, color: t.color.accentSoft },
}));
