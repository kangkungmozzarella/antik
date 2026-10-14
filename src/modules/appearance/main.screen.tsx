import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BackButton } from '@/common/components/back-button';
import { Icon } from '@/common/components/icon';
import { Screen } from '@/common/components/screen';
import { Heading, Muted, Title } from '@/common/components/text';
import { useStore } from '@/common/store/store';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';
import { pickAndKeepImage } from '@/utils/images';

import { BackgroundOption } from './components/background-option';

export default function Appearance() {
  const styles = useStyles();
  const theme = useTheme();
  const { state, dispatch } = useStore();
  const [error, setError] = useState<string | null>(null);
  const { backdrop } = state;

  async function pickPhoto() {
    setError(null);
    try {
      const uri = await pickAndKeepImage('backdrop', [9, 16]);
      if (uri) dispatch({ type: 'setBackdrop', backdrop: { kind: 'photo', uri } });
    } catch {
      setError('Could not open your photos. Check that AnTik is allowed to access them.');
    }
  }

  return (
    <View style={styles.fill}>
      <Screen withTabBar={false}>
        <View style={styles.head}>
          <Title>Background</Title>
          <Muted>Choose what sits behind your Home screen. The colours come from your {theme.name} theme.</Muted>
        </View>

        <View style={styles.section}>
          <Heading>Aurora</Heading>
          <View style={styles.grid}>
            {Object.entries(theme.backdrops).map(([key, preset]) => {
              const on = backdrop.kind === 'aurora' && backdrop.preset === key;
              return (
                <Pressable key={key} onPress={() => dispatch({ type: 'setBackdrop', backdrop: { kind: 'aurora', preset: key } })} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${preset.label} aurora`} style={styles.swatchWrap}>
                  <LinearGradient colors={preset.colors} style={[styles.swatch, on && styles.swatchOn]}>
                    {on && <Icon name="check" />}
                  </LinearGradient>
                  <Text style={styles.swatchLabel}>{preset.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Heading>Something of your own</Heading>
          <BackgroundOption
            title="Your photo"
            detail={backdrop.kind === 'photo' ? 'Tap to choose a different photo.' : 'Pick any image from your gallery.'}
            selected={backdrop.kind === 'photo'}
            onPress={pickPhoto}
            icon="image"
          />
          <BackgroundOption
            title="What's playing"
            detail="The cover of the current song, softly blurred. Uses the aurora when nothing has artwork."
            selected={backdrop.kind === 'album'}
            onPress={() => dispatch({ type: 'setBackdrop', backdrop: { kind: 'album' } })}
            icon="vinyl"
          />
          {error && <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>}
        </View>
      </Screen>
      <BackButton />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  fill: { flex: 1, backgroundColor: t.color.bg },
  head: { gap: space.sm, marginTop: 56 },
  section: { gap: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  swatchWrap: { alignItems: 'center', gap: space.xs },
  swatch: { width: 72, height: 96, borderRadius: t.radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  swatchOn: { borderColor: t.color.accentSoft },
  swatchLabel: { ...t.text.strong, fontSize: 12, color: t.color.textSoft },
  error: { ...t.text.body, color: t.color.danger, fontSize: 13 },
}));
