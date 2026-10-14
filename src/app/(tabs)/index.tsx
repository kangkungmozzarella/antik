import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Backdrop } from '@/components/backdrop';
import { Icon } from '@/components/icon';
import { PlaylistCard } from '@/components/playlist-card';
import { Screen } from '@/components/screen';
import { Body, Heading, Muted, Title } from '@/components/text';
import { useLibrary, useStore } from '@/state/store';
import { color, radius, space } from '@/theme/tokens';

function greeting(hour: number) {
  if (hour < 5) return 'Still up?';
  if (hour < 11) return 'Good morning';
  if (hour < 15) return 'Good afternoon';
  if (hour < 19) return 'Good evening';
  return 'Tonight';
}

export default function Home() {
  const { state } = useStore();
  const library = useLibrary();
  const connectedCount = Object.values(state.connected).filter(Boolean).length;
  const onlyDemo = connectedCount === 0;

  return (
    <View style={styles.fill}>
      <Backdrop />
      <Screen>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.wordmark}>AnTik</Text>
            <Title>{greeting(new Date().getHours())}</Title>
          </View>
          <Pressable onPress={() => router.push('/settings')} accessibilityLabel="Appearance settings" hitSlop={8} style={styles.iconButton}>
            <Icon name="settings" />
          </Pressable>
        </View>

        {onlyDemo && (
          <View style={styles.notice}>
            <Body style={styles.noticeTitle}>{state.demoEnabled ? 'You are browsing the demo library' : 'Nothing here yet'}</Body>
            <Muted style={styles.noticeText}>
              Connect Spotify or YouTube to bring your own playlists into AnTik.
            </Muted>
            <Pressable onPress={() => router.navigate('/connect')} style={styles.noticeButton} accessibilityRole="button">
              <Text style={styles.noticeButtonText}>Connect a service</Text>
            </Pressable>
          </View>
        )}

        {library.length > 0 && (
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

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: color.bg },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.md, marginTop: space.lg },
  headerText: { flex: 1, gap: 2 },
  wordmark: { fontSize: 13, fontWeight: '700', letterSpacing: 1, color: color.accentSoft },
  iconButton: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: color.surface },
  notice: { gap: space.sm, padding: space.lg, borderRadius: radius.lg, backgroundColor: 'rgba(19,21,39,0.85)', borderWidth: StyleSheet.hairlineWidth, borderColor: color.line },
  noticeTitle: { fontWeight: '600' },
  noticeText: { fontSize: 14, lineHeight: 20 },
  noticeButton: { alignSelf: 'flex-start', marginTop: space.xs, paddingHorizontal: space.lg, minHeight: 44, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: color.accent },
  noticeButtonText: { fontSize: 14, fontWeight: '700', color: color.accentInk },
  section: { gap: space.md },
  shelfBleed: { marginHorizontal: -space.lg },
  shelf: { gap: space.md, paddingHorizontal: space.lg },
});
