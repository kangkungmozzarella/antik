import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';

import { useTheme } from '@/common/theme/theme';

// Covers without artwork get a gradient picked from the name, so the same playlist
// always looks the same and nothing pretends to be real album art.
function hash(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function Artwork({ uri, label, size, rounded }: { uri?: string; label: string; size: number; rounded?: number }) {
  const theme = useTheme();
  const box = { width: size, height: size, borderRadius: rounded ?? theme.radius.md };
  if (uri) return <Image source={uri} style={box} contentFit="cover" transition={200} accessibilityIgnoresInvertColors />;
  const [from, to] = theme.art.palettes[hash(label) % theme.art.palettes.length];
  return (
    <LinearGradient colors={[from, to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[box, styles.fallback]}>
      <Text style={[theme.text.display, { fontSize: size * 0.38, color: theme.art.initial }]} accessible={false}>
        {label.trim().charAt(0).toUpperCase()}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
