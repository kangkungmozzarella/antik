import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/common/components/icon';
import { Body, Muted } from '@/common/components/text';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';

export function ProfileRow({ icon, title, detail, href }: { icon: IconName; title: string; detail: string; href: Href }) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <Pressable onPress={() => router.push(href)} accessibilityRole="link" accessibilityLabel={`${title}: ${detail}`} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Icon name={icon} tint={theme.color.textSoft} />
      <View style={styles.text}>
        <Body style={styles.title}>{title}</Body>
        <Muted>{detail}</Muted>
      </View>
      <Icon name="forward" size={18} tint={theme.color.textMuted} />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: t.radius.lg, backgroundColor: t.color.bgRaised, borderWidth: StyleSheet.hairlineWidth, borderColor: t.color.line },
  text: { flex: 1, gap: 2 },
  title: t.text.bold,
  pressed: { opacity: 0.7 },
}));
