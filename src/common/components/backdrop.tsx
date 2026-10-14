import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { useNowPlaying, useStore } from '@/common/store/store';
import { useTheme } from '@/common/theme/theme';

/*
  The home background the user picks in Appearance: one of the theme's aurora gradients,
  their own photo, or the artwork of what is playing. The theme's scrim always fades into
  the base colour so the text on top keeps its contrast whatever the image is.
*/
export function Backdrop() {
  const { state } = useStore();
  const theme = useTheme();
  const track = useNowPlaying();
  const { backdrop } = state;

  let layer: React.ReactNode;
  if (backdrop.kind === 'photo') {
    layer = <Image source={backdrop.uri} style={StyleSheet.absoluteFill} contentFit="cover" />;
  } else if (backdrop.kind === 'album' && track?.artwork) {
    layer = <Image source={track.artwork} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={60} />;
  } else {
    // Album mode with nothing playing (or no artwork) falls back to the theme's default aurora.
    const preset = (backdrop.kind === 'aurora' && theme.backdrops[backdrop.preset]) || theme.backdrops[theme.defaultBackdrop];
    layer = <LinearGradient colors={preset.colors} locations={[0, 0.35, 0.85]} start={{ x: 0.1, y: 0 }} end={{ x: 0.6, y: 1 }} style={StyleSheet.absoluteFill} />;
  }

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: theme.color.bg }]}>
      {layer}
      <LinearGradient colors={theme.color.scrim} locations={[0, 0.45, 0.8]} style={StyleSheet.absoluteFill} />
    </View>
  );
}
