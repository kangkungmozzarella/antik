import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNowPlaying, useStore } from '@/common/store/store';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';

import { Artwork } from './artwork';
import { Icon, type IconName } from './icon';

const tabIcons: Record<string, IconName> = { index: 'home', search: 'search', library: 'library', connect: 'link' };

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const styles = useStyles();
  const theme = useTheme();
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
              <Icon
                name={tabIcons[route.name] ?? 'home'}
                tint={focused ? theme.color.accentSoft : theme.color.textMuted}
                filled={focused && theme.icon.fillActiveTab}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MiniPlayer() {
  const styles = useStyles();
  const theme = useTheme();
  const { state, dispatch } = useStore();
  const track = useNowPlaying();
  if (!track) return null;
  const demo = track.source === 'demo';
  return (
    <Pressable onPress={() => router.push('/player')} accessibilityLabel={`Now playing: ${track.title} by ${track.artist}. Open player`} style={styles.mini}>
      <Artwork uri={track.artwork} label={track.title} size={40} rounded={theme.radius.sm} />
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

const useStyles = makeStyles((t) => ({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.md, paddingTop: space.sm, backgroundColor: t.color.glass, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.color.line },
  row: { flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: space.sm, minHeight: 48 },
  pressed: { opacity: 0.6 },
  tabLabel: { ...t.text.strong, fontSize: 11, color: t.color.textMuted },
  tabLabelOn: { color: t.color.accentSoft },
  mini: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.sm, marginBottom: space.sm, borderRadius: t.radius.md, backgroundColor: t.color.bgRaised, borderWidth: StyleSheet.hairlineWidth, borderColor: t.color.line },
  miniText: { flex: 1, minWidth: 0 },
  miniTitle: { ...t.text.strong, fontSize: 14, color: t.color.text },
  miniArtist: { ...t.text.body, fontSize: 12, color: t.color.textMuted, marginTop: 1 },
  miniButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
}));
