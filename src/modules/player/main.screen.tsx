import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Artwork } from '@/common/components/artwork';
import { Icon } from '@/common/components/icon';
import { SourceBadge } from '@/common/components/source-badge';
import { Body, Muted, Title } from '@/common/components/text';
import { useNowPlaying, useStore } from '@/common/store/store';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';

import { BobbingMascot } from './components/bobbing-mascot';
import { Vinyl } from './components/vinyl';

/*
  Each theme puts its own motif beside the cover, and it moves only while audio is
  actually playing, so the motion means something. Reduced motion keeps it still.
*/
export default function Player() {
  const styles = useStyles();
  const theme = useTheme();
  const { state, dispatch } = useStore();
  const track = useNowPlaying();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!track) {
    return (
      <View style={[styles.fill, styles.center, { paddingTop: insets.top }]}>
        <Title>Nothing is playing</Title>
        <Muted>Pick a playlist and press play.</Muted>
        <Pressable onPress={close} style={styles.textButton}><Text style={styles.textButtonLabel}>Back</Text></Pressable>
      </View>
    );
  }

  const demo = track.source === 'demo';
  const moving = state.player.playing && !demo;
  const cover = Math.min(width - space.xl * 2, 340) * 0.78;
  const { queue, index, contextName } = state.player;
  const { motif } = theme;

  return (
    <View style={styles.fill}>
      <LinearGradient colors={theme.backdrops[theme.defaultBackdrop].colors} locations={[0, 0.4, 0.9]} style={StyleSheet.absoluteFill} />
      <View style={[styles.body, { paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.xl }]}>
        <View style={styles.topBar}>
          <Pressable onPress={close} accessibilityLabel="Close player" hitSlop={8} style={styles.iconButton}>
            <Icon name="down" />
          </Pressable>
          <View style={styles.context}>
            <Text style={styles.contextLabel}>Playing from</Text>
            <Text style={styles.contextName} numberOfLines={1}>{contextName ?? 'Your library'}</Text>
          </View>
          <View style={styles.iconButton} />
        </View>

        <View style={[styles.stage, { height: cover }]}>
          {motif.kind === 'vinyl' && (
            <View style={[styles.motif, { left: cover * 0.36, top: 0 }]}>
              <Vinyl size={cover} spinning={moving} disc={motif.disc} groove={motif.groove} />
            </View>
          )}
          <View style={styles.sleeve}>
            <Artwork uri={track.artwork} label={track.title} size={cover} />
          </View>
          {motif.kind === 'mascot' && (
            <View style={[styles.motif, { left: cover * 0.72, bottom: -cover * 0.08 }]}>
              <BobbingMascot size={cover * 0.5} bobbing={moving} />
            </View>
          )}
        </View>

        <View style={styles.meta}>
          <SourceBadge source={track.source} />
          <Title numberOfLines={2}>{track.title}</Title>
          <Body style={styles.artist} numberOfLines={1}>{track.artist}</Body>
          <Muted>Track {index + 1} of {queue.length}</Muted>
        </View>

        {demo && (
          <Muted style={styles.demoNote}>Demo track: there is no audio. Connect Spotify or YouTube to play your own music.</Muted>
        )}

        <View style={styles.controls}>
          <Pressable onPress={() => dispatch({ type: 'skip', by: -1 })} accessibilityLabel="Previous track" hitSlop={8} style={styles.sideButton}>
            <Icon name="prev" size={26} />
          </Pressable>
          <Pressable
            onPress={() => dispatch({ type: 'toggle' })}
            disabled={demo}
            accessibilityLabel={demo ? 'Play (unavailable for demo tracks)' : moving ? 'Pause' : 'Play'}
            accessibilityState={{ disabled: demo }}
            style={[styles.mainButton, demo && styles.disabled]}>
            <Icon name={moving ? 'pause' : 'play'} size={30} tint={theme.color.accentInk} filled={!moving} />
          </Pressable>
          <Pressable onPress={() => dispatch({ type: 'skip', by: 1 })} accessibilityLabel="Next track" hitSlop={8} style={styles.sideButton}>
            <Icon name="next" size={26} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  fill: { flex: 1, backgroundColor: t.color.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: space.sm, padding: space.xl },
  body: { flex: 1, paddingHorizontal: space.xl, gap: space.xl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  context: { flex: 1, alignItems: 'center' },
  contextLabel: { ...t.text.strong, fontSize: 11, letterSpacing: 0.6, color: t.color.textMuted, textTransform: 'uppercase' },
  contextName: { ...t.text.strong, fontSize: 14, color: t.color.text, marginTop: 2 },
  stage: { marginTop: space.lg },
  motif: { position: 'absolute' },
  sleeve: { alignSelf: 'flex-start', shadowColor: '#000', shadowOpacity: t.scheme === 'dark' ? 0.45 : 0.18, shadowRadius: 24, shadowOffset: { width: 8, height: 12 }, elevation: 12 },
  meta: { gap: space.sm },
  artist: { fontSize: 17, color: t.color.textSoft },
  demoNote: { padding: space.md, borderRadius: t.radius.md, backgroundColor: t.color.surface, color: t.color.textSoft },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xxl, marginTop: 'auto' },
  sideButton: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  mainButton: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: t.color.accent },
  disabled: { opacity: 0.4 },
  textButton: { marginTop: space.md, minHeight: 44, justifyContent: 'center' },
  textButtonLabel: { ...t.text.bold, fontSize: 15, color: t.color.accentSoft },
}));
