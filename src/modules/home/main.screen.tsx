import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/common/components/avatar';
import { Backdrop } from '@/common/components/backdrop';
import { Mascot } from '@/common/components/mascot';
import { PlaylistCard } from '@/common/components/playlist-card';
import { Screen } from '@/common/components/screen';
import { Body, Heading, Muted, Title } from '@/common/components/text';
import { useLibrary, useStore } from '@/common/store/store';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';

function greeting(hour: number) {
  if (hour < 5) return 'Still up?';
  if (hour < 11) return 'Good morning';
  if (hour < 15) return 'Good afternoon';
  if (hour < 19) return 'Good evening';
  return 'Tonight';
}

export default function Home() {
  const styles = useStyles();
  const theme = useTheme();
  const { state } = useStore();
  const library = useLibrary();
  const connectedCount = Object.values(state.connected).filter(Boolean).length;
  const onlyDemo = connectedCount === 0;
  const firstName = state.profile.name.trim().split(/\s+/)[0];

  return (
    <View style={styles.fill}>
      <Backdrop />
      <Screen>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.wordmark}>AnTik</Text>
            <Title>{greeting(new Date().getHours())}{firstName ? `, ${firstName}` : ''}</Title>
          </View>
          <Pressable onPress={() => router.push('/profile')} accessibilityLabel="Profile" hitSlop={8}>
            <Avatar profile={state.profile} size={44} />
          </Pressable>
        </View>

        {onlyDemo && (
          <View style={styles.notice}>
            {theme.motif.kind === 'mascot' && <View style={styles.noticeMascot}><Mascot size={64} /></View>}
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

const useStyles = makeStyles((t) => ({
  fill: { flex: 1, backgroundColor: t.color.bg },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.md, marginTop: space.lg },
  headerText: { flex: 1, gap: 2 },
  wordmark: { ...t.text.bold, fontSize: 13, letterSpacing: 1, color: t.color.accentSoft },
  notice: { gap: space.sm, padding: space.lg, borderRadius: t.radius.lg, backgroundColor: t.color.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: t.color.line },
  noticeMascot: { position: 'absolute', top: -space.xl, right: space.md },
  noticeTitle: { ...t.text.strong, paddingRight: 64 },
  noticeText: { fontSize: 14, lineHeight: 20 },
  noticeButton: { alignSelf: 'flex-start', marginTop: space.xs, paddingHorizontal: space.lg, minHeight: 44, justifyContent: 'center', borderRadius: t.radius.pill, backgroundColor: t.color.accent },
  noticeButtonText: { ...t.text.bold, fontSize: 14, color: t.color.accentInk },
  section: { gap: space.md },
  shelfBleed: { marginHorizontal: -space.lg },
  shelf: { gap: space.md, paddingHorizontal: space.lg },
}));
