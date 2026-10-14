import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNowPlaying, useStore } from '@/state/store';
import { color, radius, space } from '@/theme/tokens';

import { Artwork } from './artwork';
import { Icon, type IconName } from './icon';

const tabIcons: Record<string, IconName> = { index: 'home', library: 'library', connect: 'link' };

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, space.sm) }]}>
      <MiniPlayer />
      <View style={styles.row} accessibilityRole="tablist">
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const label = descriptors[route.key].options.title ?? route.name;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
              <Icon name={tabIcons[route.name] ?? 'home'} tint={focused ? color.accentSoft : color.textMuted} />
              <Text style={[styles.tabLabel, focused && styles.tabLabelOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MiniPlayer() {
  const { state, dispatch } = useStore();
  const track = useNowPlaying();
  if (!track) return null;
  const demo = track.source === 'demo';
  return (
    <Pressable onPress={() => router.push('/player')} accessibilityLabel={`Now playing: ${track.title} by ${track.artist}. Open player`} style={styles.mini}>
      <Artwork uri={track.artwork} label={track.title} size={40} rounded={radius.sm} />
      <View style={styles.miniText}>
        <Text style={styles.miniTitle} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.miniArtist} numberOfLines={1}>{demo ? 'Demo · no audio' : track.artist}</Text>
      </View>
      {!demo && (
        <Pressable onPress={() => dispatch({ type: 'toggle' })} accessibilityLabel={state.player.playing ? 'Pause' : 'Play'} hitSlop={10} style={styles.miniButton}>
          <Icon name={state.player.playing ? 'pause' : 'play'} filled={!state.player.playing} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.md, paddingTop: space.sm, backgroundColor: 'rgba(11,12,22,0.94)', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line },
  row: { flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: space.sm, minHeight: 48 },
  pressed: { opacity: 0.6 },
  tabLabel: { fontSize: 11, fontWeight: '600', color: color.textMuted },
  tabLabelOn: { color: color.accentSoft },
  mini: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.sm, marginBottom: space.sm, borderRadius: radius.md, backgroundColor: color.bgRaised, borderWidth: StyleSheet.hairlineWidth, borderColor: color.line },
  miniText: { flex: 1, minWidth: 0 },
  miniTitle: { fontSize: 14, fontWeight: '600', color: color.text },
  miniArtist: { fontSize: 12, color: color.textMuted, marginTop: 1 },
  miniButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
