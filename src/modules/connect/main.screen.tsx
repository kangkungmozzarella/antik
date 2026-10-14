import { Platform, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/common/components/screen';
import { Body, Muted, Title } from '@/common/components/text';
import { useStore } from '@/common/store/store';
import { sourceLabel } from '@/common/store/types';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { sourceColor, space } from '@/common/theme/tokens';

// TODO: Spotify (PKCE via expo-auth-session) and YouTube (Google OAuth) sign-in land in
// the next step, once the developer client IDs exist. Until then each row says so.
const services = [
  { key: 'spotify', note: 'Playlists and liked songs. Playback opens Spotify.', status: 'Coming in the next update' },
  { key: 'youtube', note: 'Your YouTube and YouTube Music playlists, played in the YouTube player.', status: 'Coming in the next update' },
  { key: 'apple', note: 'Needs an Apple Music subscription.', status: 'Planned for later' },
] as const;

export default function Connect() {
  const styles = useStyles();
  const theme = useTheme();
  const { state, dispatch } = useStore();
  return (
    <Screen>
      <View style={styles.head}>
        <Title>Connect</Title>
        <Muted>Bring playlists from the services you already use. Music always plays through each service’s own player.</Muted>
      </View>

      <View style={styles.list}>
        {services.map((s) => (
          <View key={s.key} style={styles.card}>
            <View style={[styles.mark, { backgroundColor: sourceColor[s.key] }]} />
            <View style={styles.cardText}>
              <Body style={styles.name}>{sourceLabel[s.key]}</Body>
              <Muted>{s.note}</Muted>
              <Text style={styles.status}>{s.status}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.card, styles.demoRow]}>
        <View style={styles.cardText}>
          <Body style={styles.name}>Demo library</Body>
          <Muted>Sample playlists to explore AnTik. They are labelled “Demo” and have no audio.</Muted>
        </View>
        <Switch
          value={state.demoEnabled}
          onValueChange={(enabled) => dispatch({ type: 'setDemo', enabled })}
          trackColor={{ true: theme.color.accent, false: theme.color.surfaceStrong }}
          thumbColor="#ffffff"
          // react-native-web colours the "on" thumb separately; keep it off the default teal.
          {...(Platform.OS === 'web' ? ({ activeThumbColor: '#ffffff' } as object) : {})}
          accessibilityLabel="Show demo library"
        />
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  head: { gap: space.sm, marginTop: space.lg },
  list: { gap: space.md },
  card: { flexDirection: 'row', gap: space.md, padding: space.lg, borderRadius: t.radius.lg, backgroundColor: t.color.bgRaised, borderWidth: StyleSheet.hairlineWidth, borderColor: t.color.line },
  mark: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  cardText: { flex: 1, gap: 4 },
  name: t.text.bold,
  status: { ...t.text.strong, marginTop: 4, fontSize: 12, color: t.color.accentSoft },
  demoRow: { alignItems: 'center' },
}));
