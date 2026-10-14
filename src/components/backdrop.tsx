import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { useNowPlaying, useStore } from '@/state/store';
import { auroraPresets, color } from '@/theme/tokens';

/*
  The home background the user picks in Appearance: an aurora preset, their own photo,
  or the artwork of what is playing. A scrim always fades into the base colour so the
  text on top keeps its contrast whatever the image is.
*/
export function Backdrop() {
  const { state } = useStore();
  const track = useNowPlaying();
  const { backdrop } = state;

  let layer: React.ReactNode;
  if (backdrop.kind === 'photo') {
    layer = <Image source={backdrop.uri} style={StyleSheet.absoluteFill} contentFit="cover" />;
  } else if (backdrop.kind === 'album' && track?.artwork) {
    layer = <Image source={track.artwork} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={60} />;
  } else {
    // Album mode with nothing playing (or no artwork) falls back to the default aurora.
    const preset = backdrop.kind === 'aurora' ? backdrop.preset : 'dusk';
    layer = <LinearGradient colors={auroraPresets[preset]} locations={[0, 0.35, 0.85]} start={{ x: 0.1, y: 0 }} end={{ x: 0.6, y: 1 }} style={StyleSheet.absoluteFill} />;
  }

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.base]}>
      {layer}
      <LinearGradient colors={['rgba(11,12,22,0.35)', 'rgba(11,12,22,0.75)', color.bg]} locations={[0, 0.45, 0.8]} style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({ base: { backgroundColor: color.bg } });
