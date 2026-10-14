import { StyleSheet, Text, type TextProps } from 'react-native';

import { color, font } from '@/theme/tokens';

export function Title({ style, ...props }: TextProps) {
  return <Text accessibilityRole="header" {...props} style={[styles.title, style]} />;
}
export function Heading({ style, ...props }: TextProps) {
  return <Text accessibilityRole="header" {...props} style={[styles.heading, style]} />;
}
export function Body({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.body, style]} />;
}
export function Muted({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.muted, style]} />;
}

const styles = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 32, lineHeight: 38, color: color.text, letterSpacing: -0.4 },
  heading: { fontFamily: font.display, fontSize: 21, lineHeight: 26, color: color.text },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 21, color: color.text },
  muted: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.textMuted },
});
