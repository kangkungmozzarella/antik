import { Platform, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Body, Muted, Title } from '@/components/text';
import { useStore } from '@/state/store';
import { sourceLabel } from '@/state/types';
import { color, radius, sourceColor, space } from '@/theme/tokens';

// TODO: Spotify (PKCE via expo-auth-session) and YouTube (Google OAuth) sign-in land in
// the next step, once the developer client IDs exist. Until then each row says so.
const services = [
  { key: 'spotify', note: 'Playlists and liked songs. Playback opens Spotify.', status: 'Coming in the next update' },
  { key: 'youtube', note: 'Your YouTube and YouTube Music playlists, played in the YouTube player.', status: 'Coming in the next update' },
  { key: 'apple', note: 'Needs an Apple Music subscription.', status: 'Planned for later' },
] as const;

export default function Connect() {
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
          trackColor={{ true: color.accent, false: color.surfaceStrong }}
          thumbColor={color.text}
          // react-native-web colours the "on" thumb separately; keep it off the default teal.
          {...(Platform.OS === 'web' ? ({ activeThumbColor: color.text } as object) : {})}
          accessibilityLabel="Show demo library"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: space.sm, marginTop: space.lg },
  list: { gap: space.md },
  card: { flexDirection: 'row', gap: space.md, padding: space.lg, borderRadius: radius.lg, backgroundColor: color.bgRaised, borderWidth: StyleSheet.hairlineWidth, borderColor: color.line },
  mark: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  cardText: { flex: 1, gap: 4 },
  name: { fontWeight: '700' },
  status: { marginTop: 4, fontSize: 12, fontWeight: '600', color: color.accentSoft },
  demoRow: { alignItems: 'center' },
});
