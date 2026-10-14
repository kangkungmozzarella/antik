import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { Artwork } from '@/components/artwork';
import { Icon } from '@/components/icon';
import { SourceBadge } from '@/components/source-badge';
import { Body, Muted, Title } from '@/components/text';
import { useNowPlaying, useStore } from '@/state/store';
import { auroraPresets, color, radius, space } from '@/theme/tokens';

/*
  The vinyl is AnTik's motif: the record slides half out of its sleeve (the cover) and
  turns only while audio is actually playing, so the motion means something. Reduced
  motion keeps it still.
*/
function Vinyl({ size, spinning }: { size: number; spinning: boolean }) {
  const reduceMotion = useReducedMotion();
  const turn = useSharedValue(0);

  useEffect(() => {
    if (spinning && !reduceMotion) {
      turn.value = withRepeat(withTiming(turn.value + 360, { duration: 6000, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(turn);
    }
  }, [spinning, reduceMotion, turn]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));
  const grooves = [0.92, 0.82, 0.72, 0.62, 0.52];
  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx={50} cy={50} r={49} fill="#121220" />
        {grooves.map((g) => <Circle key={g} cx={50} cy={50} r={49 * g} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={0.6} />)}
        <Circle cx={50} cy={50} r={17} fill={color.accent} />
        <Circle cx={50} cy={50} r={2.2} fill="#121220" />
      </Svg>
    </Animated.View>
  );
}

export default function Player() {
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
  const cover = Math.min(width - space.xl * 2, 340) * 0.78;
  const { playing, queue, index, contextName } = state.player;

  return (
    <View style={styles.fill}>
      <LinearGradient colors={auroraPresets.dusk} locations={[0, 0.4, 0.9]} style={StyleSheet.absoluteFill} />
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
          <View style={[styles.vinyl, { left: cover * 0.36 }]}>
            <Vinyl size={cover} spinning={playing && !demo} />
          </View>
          <View style={styles.sleeve}>
            <Artwork uri={track.artwork} label={track.title} size={cover} rounded={radius.md} />
          </View>
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
            accessibilityLabel={demo ? 'Play (unavailable for demo tracks)' : playing ? 'Pause' : 'Play'}
            accessibilityState={{ disabled: demo }}
            style={[styles.mainButton, demo && styles.disabled]}>
            <Icon name={playing && !demo ? 'pause' : 'play'} size={30} tint={color.accentInk} filled={!(playing && !demo)} />
          </Pressable>
          <Pressable onPress={() => dispatch({ type: 'skip', by: 1 })} accessibilityLabel="Next track" hitSlop={8} style={styles.sideButton}>
            <Icon name="next" size={26} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: color.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: space.sm, padding: space.xl },
  body: { flex: 1, paddingHorizontal: space.xl, gap: space.xl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  context: { flex: 1, alignItems: 'center' },
  contextLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, color: color.textMuted, textTransform: 'uppercase' },
  contextName: { fontSize: 14, fontWeight: '600', color: color.text, marginTop: 2 },
  stage: { marginTop: space.lg },
  vinyl: { position: 'absolute', top: 0 },
  sleeve: { alignSelf: 'flex-start', shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 24, shadowOffset: { width: 8, height: 12 }, elevation: 12 },
  meta: { gap: space.sm },
  artist: { fontSize: 17, color: color.textSoft },
  demoNote: { padding: space.md, borderRadius: radius.md, backgroundColor: color.surface, color: color.textSoft },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xxl, marginTop: 'auto' },
  sideButton: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  mainButton: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: color.accent },
  disabled: { opacity: 0.4 },
  textButton: { marginTop: space.md, minHeight: 44, justifyContent: 'center' },
  textButtonLabel: { fontSize: 15, fontWeight: '700', color: color.accentSoft },
});
