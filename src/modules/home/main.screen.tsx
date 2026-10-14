import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/common/components/avatar';
import { Backdrop } from '@/common/components/backdrop';
import { Icon } from '@/common/components/icon';
import { Mascot } from '@/common/components/mascot';
import { PlaylistCard } from '@/common/components/playlist-card';
import { Screen } from '@/common/components/screen';
import { Body, Heading, Muted, Title } from '@/common/components/text';
import { useLibrary, useNowPlaying, useStore, useUnreadCount } from '@/common/store/store';
import type { Track } from '@/common/store/types';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';

import { CollectionShelf } from './components/collection-shelf';
import { FilterChips, type HomeFilter } from './components/filter-chips';
import { RecentGrid } from './components/recent-grid';
import { SongShelf } from './components/song-shelf';
import { useHomeFeed } from './hooks/use-home-feed';

function greeting(hour: number) {
  if (hour < 5) return 'Still up?';
  if (hour < 11) return 'Good morning';
  if (hour < 15) return 'Good afternoon';
  if (hour < 19) return 'Good evening';
  return 'Tonight';
}

const RECENT_TILES = 6;

export default function Home() {
  const styles = useStyles();
  const theme = useTheme();
  const { state, dispatch } = useStore();
  const library = useLibrary();
  const current = useNowPlaying();
  const unread = useUnreadCount();
  const feed = useHomeFeed();
  const [filter, setFilter] = useState<HomeFilter>('all');
  const firstName = state.profile.name.trim().split(/\s+/)[0];

  const showSongs = filter !== 'playlists';
  const showPlaylists = filter !== 'songs';
  const recent = state.history.slice(0, RECENT_TILES);

  const play = (queue: Track[], index: number, contextName: string) => {
    dispatch({ type: 'play', queue, index, contextName });
    router.push('/player');
  };

  return (
    <View style={styles.fill}>
      <Backdrop />
      <Screen refreshControl={<RefreshControl refreshing={feed.refreshing} onRefresh={feed.refresh} tintColor={theme.color.accentSoft} colors={[theme.color.accent]} />}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.wordmark}>AnTik</Text>
            <Title>{greeting(new Date().getHours())}{firstName ? `, ${firstName}` : ''}</Title>
          </View>
          <View style={styles.actions}>
            <Pressable
              onPress={() => router.push('/notifications')}
              accessibilityLabel={unread ? `Notifications, ${unread} unread` : 'Notifications'}
              hitSlop={8}
              style={styles.iconButton}>
              <Icon name="bell" />
              {unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push('/profile')} accessibilityLabel="Profile" hitSlop={8}>
              <Avatar profile={state.profile} size={44} />
            </Pressable>
          </View>
        </View>

        <FilterChips value={filter} onChange={setFilter} />

        {showSongs && recent.length > 0 && (
          <RecentGrid tracks={recent} onPlay={(i) => play(state.history, i, 'Recently played')} />
        )}

        {/* Before anything has been played, say where music comes from. */}
        {filter === 'all' && state.history.length === 0 && (
          <View style={styles.notice}>
            {theme.motif.kind === 'mascot' && <View style={styles.noticeMascot}><Mascot size={64} /></View>}
            <Body style={styles.noticeTitle}>Find something to play</Body>
            <Muted style={styles.noticeText}>Search YouTube Music, start from the picks below, or connect a service for your own playlists.</Muted>
            <Pressable onPress={() => router.navigate('/search')} style={styles.noticeButton} accessibilityRole="button">
              <Text style={styles.noticeButtonText}>Search songs</Text>
            </Pressable>
          </View>
        )}

        {feed.loading && (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.color.accentSoft} />
            <Muted>Loading picks from YouTube Music…</Muted>
          </View>
        )}

        {feed.error && !feed.sections && (
          <View style={styles.loading}>
            <Muted style={styles.center}>Could not load recommendations from YouTube Music.</Muted>
            <Pressable onPress={feed.refresh} style={styles.retry} accessibilityRole="button">
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        )}

        {feed.sections?.map((section) => {
          const songs = showSongs ? section.songs : [];
          const collections = showPlaylists ? section.collections : [];
          if (!songs.length && !collections.length) return null;
          return (
            <View key={section.title} style={styles.section}>
              <Heading>{section.title}</Heading>
              {songs.length > 0 && <SongShelf songs={songs} activeId={current?.id} onPlay={(i) => play(songs, i, section.title)} />}
              {collections.length > 0 && <CollectionShelf collections={collections} />}
            </View>
          );
        })}

        {showPlaylists && library.length > 0 && (
          <View style={styles.section}>
            <Heading>Your playlists</Heading>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelf} style={styles.shelfBleed}>
              {library.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}
            </ScrollView>
          </View>
        )}
      </Screen>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  fill: { flex: 1, backgroundColor: t.color.bg },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.md, marginTop: space.lg },
  headerText: { flex: 1, gap: 2 },
  wordmark: { ...t.text.bold, fontSize: 13, letterSpacing: 1, color: t.color.accentSoft },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  iconButton: { width: 44, height: 44, borderRadius: t.radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: t.color.surface },
  badge: { position: 'absolute', top: 4, right: 2, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: t.color.danger },
  // Antik's danger is a light coral and needs dark ink; Puding's is a deep red that takes white.
  badgeText: { ...t.text.bold, fontSize: 10, color: t.scheme === 'dark' ? t.color.accentInk : '#ffffff' },
  notice: { gap: space.sm, padding: space.lg, borderRadius: t.radius.lg, backgroundColor: t.color.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: t.color.line },
  noticeMascot: { position: 'absolute', top: -space.xl, right: space.md },
  noticeTitle: { ...t.text.strong, paddingRight: 64 },
  noticeText: { fontSize: 14, lineHeight: 20 },
  noticeButton: { alignSelf: 'flex-start', marginTop: space.xs, paddingHorizontal: space.lg, minHeight: 44, justifyContent: 'center', borderRadius: t.radius.pill, backgroundColor: t.color.accent },
  noticeButtonText: { ...t.text.bold, fontSize: 14, color: t.color.accentInk },
  loading: { alignItems: 'center', gap: space.sm, paddingVertical: space.lg },
  center: { textAlign: 'center' },
  retry: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.lg },
  retryText: { ...t.text.bold, fontSize: 14, color: t.color.accentSoft },
  section: { gap: space.md },
  shelfBleed: { marginHorizontal: -space.lg },
  shelf: { gap: space.md, paddingHorizontal: space.lg },
}));
