import { Text, type TextProps } from 'react-native';

import { makeStyles } from '@/common/theme/theme';

export function Title({ style, ...props }: TextProps) {
  const styles = useStyles();
  return <Text accessibilityRole="header" {...props} style={[styles.title, style]} />;
}
export function Heading({ style, ...props }: TextProps) {
  const styles = useStyles();
  return <Text accessibilityRole="header" {...props} style={[styles.heading, style]} />;
}
export function Body({ style, ...props }: TextProps) {
  const styles = useStyles();
  return <Text {...props} style={[styles.body, style]} />;
}
export function Muted({ style, ...props }: TextProps) {
  const styles = useStyles();
  return <Text {...props} style={[styles.muted, style]} />;
}

const useStyles = makeStyles((t) => ({
  title: { ...t.text.display, fontSize: 32, lineHeight: 38, color: t.color.text, letterSpacing: -0.4 },
  heading: { ...t.text.display, fontSize: 21, lineHeight: 26, color: t.color.text },
  body: { ...t.text.body, fontSize: 15, lineHeight: 21, color: t.color.text },
  muted: { ...t.text.body, fontSize: 13, lineHeight: 18, color: t.color.textMuted },
}));
