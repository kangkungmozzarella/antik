import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';

import { Icon } from '@/common/components/icon';
import { Screen } from '@/common/components/screen';
import { Muted, Title } from '@/common/components/text';
import { useNowPlaying, useStore } from '@/common/store/store';
import type { Track } from '@/common/store/types';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';
import { searchSongs } from '@/common/youtube/client';

import { SongRow } from './components/song-row';

type Results = { query: string; tracks: Track[] } | { query: string; error: string };

export default function Search() {
  const styles = useStyles();
  const theme = useTheme();
  const { dispatch } = useStore();
  const current = useNowPlaying();
  const [query, setQuery] = useState('');
  const [latest, setLatest] = useState<Results | null>(null);
  const q = query.trim();
  const searching = q.length >= 2;
  // Older results stay on screen while the new query loads.
  const results = searching ? latest : null;
  const loading = searching && latest?.query !== q;

  // Search once typing pauses, so each keystroke does not hit YouTube.
  useEffect(() => {
    if (!searching) return;
    let stale = false;
    const timer = setTimeout(() => {
      searchSongs(q)
        .then((tracks) => !stale && setLatest({ query: q, tracks }))
        .catch((error: unknown) => !stale && setLatest({ query: q, error: error instanceof Error ? error.message : String(error) }));
    }, 500);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [q, searching]);

  const play = (tracks: Track[], index: number) => {
    dispatch({ type: 'play', queue: tracks, index, contextName: `Search: ${q}` });
    router.push('/player');
  };

  return (
    <Screen keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <View style={styles.head}>
        <Title>Search</Title>
        <Muted>Songs from YouTube Music. Prototype: this uses YouTube’s private API and may stop working at any time.</Muted>
      </View>

      <View style={styles.search}>
        <Icon name="search" size={18} tint={theme.color.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Songs, artists, albums"
          placeholderTextColor={theme.color.textMuted}
          style={styles.input}
          accessibilityLabel="Search YouTube Music"
          returnKeyType="search"
          autoCorrect={false}
        />
        {loading && <ActivityIndicator color={theme.color.accentSoft} />}
      </View>

      <View>
        {results && 'error' in results && (
          <Muted style={styles.message}>Could not search right now. {results.error}</Muted>
        )}
        {results && 'tracks' in results && results.tracks.length === 0 && (
          <Muted style={styles.message}>{`No songs found for "${results.query}".`}</Muted>
        )}
        {results && 'tracks' in results && results.tracks.map((track, i) => (
          <SongRow key={track.id} track={track} active={current?.id === track.id} onPress={() => play(results.tracks, i)} />
        ))}
        {!results && !loading && <Muted style={styles.message}>Type at least two letters to search.</Muted>}
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  head: { gap: space.sm, marginTop: space.lg },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, minHeight: 48, borderRadius: t.radius.md, backgroundColor: t.color.surface },
  input: { ...t.text.body, flex: 1, fontSize: 15, color: t.color.text, paddingVertical: space.sm },
  message: { paddingVertical: space.xl, textAlign: 'center' },
}));
