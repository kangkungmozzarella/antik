import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';

import { font, radius } from '@/theme/tokens';

// Covers without artwork get a gradient picked from the name, so the same playlist
// always looks the same and nothing pretends to be real album art.
const palettes: [string, string][] = [
  ['#3b2f8a', '#8f8cf6'],
  ['#1f4f8f', '#5fb3d9'],
  ['#7a2f3f', '#e08a6a'],
  ['#1f5a52', '#7cc7a8'],
  ['#5a2f7a', '#d18be0'],
];
function hash(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function Artwork({ uri, label, size, rounded = radius.md }: { uri?: string; label: string; size: number; rounded?: number }) {
  const box = { width: size, height: size, borderRadius: rounded };
  if (uri) return <Image source={uri} style={box} contentFit="cover" transition={200} accessibilityIgnoresInvertColors />;
  const [from, to] = palettes[hash(label) % palettes.length];
  return (
    <LinearGradient colors={[from, to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[box, styles.fallback]}>
      <Text style={[styles.initial, { fontSize: size * 0.38 }]} accessible={false}>
        {label.trim().charAt(0).toUpperCase()}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initial: { fontFamily: font.display, color: 'rgba(255,255,255,0.85)' },
});
