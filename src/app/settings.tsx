import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { Body, Heading, Muted, Title } from '@/components/text';
import { useStore } from '@/state/store';
import { auroraPresets, color, radius, space, type AuroraPreset } from '@/theme/tokens';

const presetNames: Record<AuroraPreset, string> = { dusk: 'Dusk', ocean: 'Ocean', ember: 'Ember', forest: 'Forest' };

export default function Settings() {
  const { state, dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);
  const { backdrop } = state;

  async function pickPhoto() {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [9, 16], quality: 0.8 });
      if (!result.canceled) dispatch({ type: 'setBackdrop', backdrop: { kind: 'photo', uri: result.assets[0].uri } });
    } catch {
      setError('Could not open your photos. Check that AnTik is allowed to access them.');
    }
  }

  return (
    <View style={styles.fill}>
      <Screen withTabBar={false}>
        <View style={styles.head}>
          <Title>Appearance</Title>
          <Muted>Choose the background behind your Home screen.</Muted>
        </View>

        <View style={styles.section}>
          <Heading>Aurora</Heading>
          <View style={styles.grid}>
            {(Object.keys(auroraPresets) as AuroraPreset[]).map((key) => {
              const on = backdrop.kind === 'aurora' && backdrop.preset === key;
              return (
                <Pressable key={key} onPress={() => dispatch({ type: 'setBackdrop', backdrop: { kind: 'aurora', preset: key } })} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${presetNames[key]} aurora`} style={styles.swatchWrap}>
                  <LinearGradient colors={auroraPresets[key]} style={[styles.swatch, on && styles.swatchOn]}>
                    {on && <Icon name="check" tint={color.text} />}
                  </LinearGradient>
                  <Text style={styles.swatchLabel}>{presetNames[key]}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Heading>Something of your own</Heading>
          <Option
            title="Your photo"
            detail={backdrop.kind === 'photo' ? 'Tap to choose a different photo.' : 'Pick any image from your gallery.'}
            selected={backdrop.kind === 'photo'}
            onPress={pickPhoto}
            icon="image"
          />
          <Option
            title="What's playing"
            detail="The cover of the current song, softly blurred. Uses the aurora when nothing has artwork."
            selected={backdrop.kind === 'album'}
            onPress={() => dispatch({ type: 'setBackdrop', backdrop: { kind: 'album' } })}
            icon="vinyl"
          />
          {error && <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>}
        </View>
      </Screen>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityLabel="Back" hitSlop={8} style={[styles.back, { top: insets.top + space.sm }]}>
        <Icon name="back" />
      </Pressable>
    </View>
  );
}

function Option({ title, detail, selected, onPress, icon }: { title: string; detail: string; selected: boolean; onPress: () => void; icon: 'image' | 'vinyl' }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: selected }} style={({ pressed }) => [styles.option, selected && styles.optionOn, pressed && styles.pressed]}>
      <Icon name={icon} tint={selected ? color.accentSoft : color.textSoft} />
      <View style={styles.optionText}>
        <Body style={styles.optionTitle}>{title}</Body>
        <Muted>{detail}</Muted>
      </View>
      {selected && <Icon name="check" tint={color.accentSoft} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: color.bg },
  back: { position: 'absolute', left: space.md, width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: color.surface },
  head: { gap: space.sm, marginTop: 56 },
  section: { gap: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  swatchWrap: { alignItems: 'center', gap: space.xs },
  swatch: { width: 72, height: 96, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  swatchOn: { borderColor: color.accentSoft },
  swatchLabel: { fontSize: 12, fontWeight: '600', color: color.textSoft },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.lg, backgroundColor: color.bgRaised, borderWidth: 1, borderColor: color.line },
  optionOn: { borderColor: color.accent },
  pressed: { opacity: 0.7 },
  optionText: { flex: 1, gap: 2 },
  optionTitle: { fontWeight: '700' },
  error: { color: color.danger, fontSize: 13 },
});
